import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import { logEvent } from "./utilities";
import authenticated from "./authentication";
import { store } from "..";
import { SHOW_LOADER } from "./constants";
import { getAccounts } from "./account";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const deleteMembership = (membership_id) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Unlinking..." } });
  return API.del(
    Gateway.name,
    `/membership/delete-account-membership/${membership_id}/${store.getState().session.primary_account_id || store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    })
    .then((deleted) => {
      if (deleted.success) {
        dispatch(authenticated.login());
        dispatch(getAccounts(store.getState().user.cognito_id, (store.getState().session.primary_account_id || store.getState().session.account_id), true));
        dispatch(showNotification("success", "Account Membership Removed", "This account membership was removed."));
      } else {
        dispatch(showNotification("error", "Account Membership Removal Failed", "We could not remove this membership from your account."));
      }
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(logEvent("account user deleted", store.getState().user));
      return deleted;
    })
    .catch((error) => {
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(showNotification("error", "Membership Removal", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const approveAccountMembership = (account_id, updates) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Approving..." } });
  return API.patch(
    Gateway.name,
    `/membership/approve-account-membership/${store.getState().session.primary_account_id || store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates,
        approval_id: account_id,
        referral: store.getState().user.is_partner ? store.getState().user.coupon : false
      }
    })
    .then((updated) => {
      if (updated.success) {
        dispatch(authenticated.login());
        dispatch(getAccounts(store.getState().user.cognito_id, account_id, true));
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

export const updateCurrentMembership = (updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
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
      if (updated.success) dispatch(authenticated.login());
      return updated;
    })
    .catch((error) => {
      return { success: false };
    });
};