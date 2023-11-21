import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import { navigateTo } from "./navigation";
import { sleep } from "../../utilities";
import { toastr } from "react-redux-toastr";
import {
  UPDATE_APP_VERSION,
  OPEN_INSTALL_PROMPT_MODAL,
  CLOSE_INSTALL_PROMPT_MODAL,
  SET_SESSION_ACCOUNT,
  IS_LOGGED_IN,
  SHOW_LOADER,
  CLEAR_ALL
} from "./constants";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const closeInstalliOSWebAppModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_INSTALL_PROMPT_MODAL });
};

export const openInstalliOSWebAppModal = () => async (dispatch) => {
  dispatch({ type: OPEN_INSTALL_PROMPT_MODAL });
};

export const updateAppVersion = () => async (dispatch) => {
  const account_id = store.getState().session.account_id;
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Updating..." } });
  if (store.getState().user) {
    return Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user) => {
      const token = user.signInUserSession.idToken.jwtToken;
      const storedUser = await API.get(Gateway.name, `/users/${user.username}`, { headers: { Authorization: token } });
      if (storedUser.success) {
        dispatch({ type: UPDATE_APP_VERSION });
        dispatch({ type: CLEAR_ALL });
        dispatch(showNotification("success", "Application Updated", "Great! You are now running the latest version of Hope Trust. Reloading your app..."));
        dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token, user, primary_account_id: store.getState().session.primary_account_id } });
        await sleep(3000);
        toastr.clean();
        dispatch(navigateTo("/"));
        await sleep(5000);
        window.location.reload();
        return true;
      }
    })
    .catch((error) => {
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