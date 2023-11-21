import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import { logEvent } from "./utilities";
import {
  CREATE_NEW_RELATIONSHIP,
  UPDATE_RELATIONSHIP,
  DELETE_RELATIONSHIP,
  OPEN_CREATE_RELATIONSHIP_MODAL,
  CLOSE_CREATE_RELATIONSHIP_MODAL
} from "./constants";
import { store } from "..";
import { getRelationships } from "./account";
const Gateway = apiGateway.find((gateway) => gateway.name === "users");

export const createRelationship = (data, account_id, target_hubspot_deal_id = false) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/${store.getState().session.account_id}/create-account-user`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "newAccountUser": {
          ...data.newAccountUser,
          "status": "active"
        },
        ...data.newAccountMembership,
        "permissions": data.newAccountMembership.permissions,
        "account_id": account_id || store.getState().session.account_id,
        "sendEmail": data.newAccountMembership.notify,
        "creator": store.getState().user,
        target_hubspot_deal_id
      }
    })
    .then((newUser) => {
      dispatch({ type: CREATE_NEW_RELATIONSHIP, payload: newUser.payload });
      dispatch(getRelationships(true));
      return newUser;
    })
    .catch((error) => {
      return { success: false, message: error.response.data.message };
    });
};

export const updateRelationship = (data, cognito_id, account_id) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update-account-user/${account_id || store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "updates": {
          ...data.newAccountUser,
          "status": "active"
        },
        "permissions": data.newAccountMembership.permissions,
        ...data.newAccountMembership,
        cognito_id
      }
    })
    .then((newUser) => {
      dispatch({ type: UPDATE_RELATIONSHIP, payload: newUser.payload });
      dispatch(getRelationships(true));
      return newUser;
    })
    .catch((error) => {
      return { success: false, message: error.response.data.message };
    });
};

export const deleteRelationship = (cognito_id) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/delete-account-user/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        cognito_id
      }
    }).then((data) => {
      dispatch({ type: DELETE_RELATIONSHIP, payload: cognito_id });
      dispatch(getRelationships(true));
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const resetUserPassword = (user) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/reset-user-password/${store.getState().user.cognito_id}/${store.getState().session.account_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        user
      }
    }).then((data) => {
      dispatch(showNotification("success", "Password Reset", `Great. A new temporary password has been sent to ${user.email}. It may take a few minutes to arrive.`));
      return { success: true };
    }).catch((error) => {
      dispatch(showNotification("error", "Password Reset Failed", `Could not reset password for ${user.email}`));
      return {
        success: false,
        error
      };
    });
};

export const openCreateRelationshipModal = (defaults, updating, viewing, account_id, target_hubspot_deal_id, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_RELATIONSHIP_MODAL, payload: { defaults, updating, viewing, account_id, target_hubspot_deal_id, current_page } });
  dispatch(logEvent("relationship", store.getState().user, "modal"));
};

export const closeCreateRelationshipModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_RELATIONSHIP_MODAL });
};
