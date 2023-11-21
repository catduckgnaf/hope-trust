import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { showNotification } from "./notification";
import { getRelationships } from "./relationship";
import authenticated from "./authentication";
import {
  CHANGE_ACCOUNTS_TAB,
  SHOW_LOADER,
  OPEN_CREATE_ACCOUNT_MODAL,
  CLOSE_CREATE_ACCOUNT_MODAL,
  CLEAR_SIGNUP_STATE
} from "./constants";

export const getAccountFeatures = (account_id) => async (dispatch) => {
  return API.get(
    apiGateway.NAME,
    `/accounts/get-account-features/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      queryStringParameters: {
        lookup_id: account_id
      }
    })
    .then((features) => {
      return features.payload;
    })
    .catch((error) => {
      return { success: false };
    });
};

export const approveAccountMembership = (cognito_id) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Approving..." } });
  return API.patch(
    apiGateway.NAME,
    `/membership/approve-account-membership/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        cognito_id
      }
    })
    .then((updated) => {
      if (updated.success) {
        dispatch(authenticated.login());
        dispatch(getRelationships(true));
        dispatch(showNotification("success", "Account Membership Approved", "New membership was approved."));
      } else {
        dispatch(showNotification("error", "Account Membership Approval Failed", "We could not approve this membership."));
      }
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      return updated;
    })
    .catch((error) => {
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(showNotification("error", "Membership Update", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const updateCurrentMembership = (updates, reload = true) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/membership/update/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    })
    .then((updated) => {
      if (updated.success && reload) dispatch(authenticated.login());
      return updated;
    })
    .catch((error) => {
      return { success: false };
    });
};

export const updateBenefitsConfig = (updates) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/accounts/update-benefits-config/${store.getState().user.benefits_data.config_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    })
    .then((updated) => {
      if (updated.success) dispatch(authenticated.login());
      return updated;
    })
    .catch((error) => {
      return { success: false };
    });
};

export const openCreateAccountModal = (config) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_ACCOUNT_MODAL, payload: config });
};

export const closeCreateAccountModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_ACCOUNT_MODAL });
  dispatch({ type: CLEAR_SIGNUP_STATE });
};

export const changeAccountsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_ACCOUNTS_TAB, payload: tab });
};