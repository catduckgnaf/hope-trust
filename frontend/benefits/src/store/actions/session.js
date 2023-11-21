import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import { loadHubspotDefaults } from "../../hubspot-config";
import { sleep } from "../../utilities";
import { navigateTo } from "./navigation";
import { toastr } from "react-redux-toastr";
import moment from "moment";
import {
  UPDATE_APP_VERSION,
  UPDATE_SESSION,
  UPDATE_ZENDESK_STATE,
  OPEN_INSTALL_PROMPT_MODAL,
  CLOSE_INSTALL_PROMPT_MODAL,
  SET_SESSION_ACCOUNT,
  IS_LOGGED_IN,
  SHOW_LOADER,
  OPEN_PARTNER_LOGO_MODAL,
  CLOSE_PARTNER_LOGO_MODAL,
  CLEAR_ALL
} from "./constants";
import { store } from "..";

export const getHubspotVisitorToken = () => async (dispatch) => {
  if (!store.getState().session.fetching_visitor_token && !store.getState().session.has_fetched_visitor_token && (!store.getState().session.refresh_time || moment().isAfter(store.getState().session.refresh_time))) {
    dispatch({ type: UPDATE_ZENDESK_STATE, payload: { "fetching_visitor_token": true } });
    return API.get(
      apiGateway.NAME,
      `/hubspot/get-visitor-token/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      })
      .then((jwt) => {
        dispatch({
          type: UPDATE_ZENDESK_STATE, payload: {
            "hubspot_visitor_token": jwt.payload,
            "fetching_visitor_token": false,
            "has_fetched_visitor_token": true,
            "refresh_time": moment().add(1, "hours")
          }
        });
        return jwt;
      })
      .catch((error) => {
        dispatch({ type: UPDATE_ZENDESK_STATE, payload: { "fetching_visitor_token": false, "chat_open": false } });
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      });
  }
};

export const openHubspotChat = () => async (dispatch) => {
  loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token)
  .then(() => {
    dispatch({ type: UPDATE_ZENDESK_STATE, payload: { "chat_open": true } });
  });
};

export const updateSession = (id, value) => async (dispatch) => {
  dispatch({ type: UPDATE_SESSION, payload: { [id]: value } });
};

export const updateZendeskState = (id, value) => async (dispatch) => {
  dispatch({ type: UPDATE_ZENDESK_STATE, payload: { [id]: value } });
};

export const closeInstalliOSWebAppModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_INSTALL_PROMPT_MODAL });
};

export const openInstalliOSWebAppModal = () => async (dispatch) => {
  dispatch({ type: OPEN_INSTALL_PROMPT_MODAL });
};

export const openPartnerLogoModal = () => async (dispatch) => {
  dispatch({ type: OPEN_PARTNER_LOGO_MODAL });
};

export const closePartnerLogoModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_PARTNER_LOGO_MODAL });
};

export const clearAll = () => async (dispatch) => {
  dispatch({ type: CLEAR_ALL });
};

export const updateAppVersion = () => async (dispatch) => {
  const account_id = store.getState().session.account_id;
  const current_location = store.getState().router.location.pathname;
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Updating..." } });
  if (store.getState().user) {
    return Auth.currentAuthenticatedUser({ bypassCache: true })
      .then(async (user) => {
        const token = user.signInUserSession.idToken.jwtToken;
        const storedUser = await API.get(apiGateway.NAME, `/users/${user.username}`, { headers: { Authorization: token } });
        if (storedUser.success) {
          dispatch({ type: UPDATE_APP_VERSION });
          dispatch({ type: CLEAR_ALL });
          dispatch(showNotification("success", "Application Updated", "Great! You are now running the latest version of Hope Trust. Reloading your app..."));
          dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
          dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token, user, primary_account_id: store.getState().session.primary_account_id } });
          dispatch(navigateTo(current_location || "/"));
          await sleep(3000);
          toastr.clean();
          await sleep(2000);
          window.location.reload();
          return true;
        }
      })
      .catch((error) => {
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { primary_account_id: store.getState().session.primary_account_id } });
        dispatch({ type: SHOW_LOADER, payload: { show: false } });
        if (error) dispatch(showNotification("error", "Application Update Failed", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
        return false;
      });
  } else {
    dispatch({ type: UPDATE_APP_VERSION });
    dispatch({ type: CLEAR_ALL });
    dispatch(showNotification("success", "Application Updated", "Great! You are now running the latest version of Hope Trust. Reloading your app..."));
    await sleep(3000);
    toastr.clean();
    await sleep(2000);
    window.location.reload();
    return true;
  }
};