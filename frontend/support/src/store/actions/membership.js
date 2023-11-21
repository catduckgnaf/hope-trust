import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import authenticated from "./authentication";
import {
  ADD_MEMBERSHIP
} from "./constants";
import { customerServiceGetAllUsers, customerServiceGetPendingApprovals, getUserRecord } from "./customer-support";
import { showNotification } from "./notification";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const createMembership = (account_id, cognito_id, data) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/membership/create-new-membership/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        target_account_id: account_id,
        cognito_id,
        data
      }
    }).then((data) => {
      dispatch({ type: ADD_MEMBERSHIP, payload: data.payload });
      dispatch(customerServiceGetAllUsers(true));
      dispatch(customerServiceGetPendingApprovals(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateMembership = (target_account_id, target_cognito_id, updates, user_cognito_id) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/membership/update/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates,
        target_account_id,
        target_cognito_id
      }
    }).then((data) => {
      if (data.success) {
        dispatch(getUserRecord(user_cognito_id));
        if (target_cognito_id === store.getState().user.cognito_id) dispatch(authenticated.login());
      }
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const deleteMembership = (membership_id) => async (dispatch) => {
  return API.del(
    Gateway.name,
    `/membership/delete-account-membership/${membership_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    })
    .then((deleted) => {
      if (deleted.success) {
        dispatch(showNotification("success", "Account Membership Removed", "This account membership was removed."));
      } else {
        dispatch(showNotification("error", "Account Membership Removal Failed", "We could not remove this membership."));
      }
      return deleted;
    })
    .catch((error) => {
      dispatch(showNotification("error", "Membership Removal", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};