import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { getCurrentUser } from "./user";
import { showNotification } from "./notification";
import { logEvent } from "./utilities";
import {
  GET_RELATIONSHIPS,
  IS_FETCHING_RELATIONSHIPS,
  HAS_REQUESTED_RELATIONSHIPS,
  CREATE_NEW_RELATIONSHIP,
  UPDATE_RELATIONSHIP,
  DELETE_RELATIONSHIP,
  OPEN_CREATE_RELATIONSHIP_MODAL,
  CLOSE_CREATE_RELATIONSHIP_MODAL,
  UPDATE_LOGGEDIN_USER
} from "./constants";
import { store } from "..";

export const getRelationships = (override = false) => async (dispatch) => {
  if ((!store.getState().relationship.isFetching && !store.getState().relationship.requested) || override) {
    dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: true });
    try {
      const data = await API.get(
        apiGateway.NAME,
        `/accounts/get-account-users/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_RELATIONSHIPS, payload: data.payload });
        dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_RELATIONSHIPS, payload: true });
        dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_RELATIONSHIPS, payload: true });
      dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const createRelationship = (newRelationship, account_id, target_hubspot_deal_id = false) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/users/${store.getState().session.account_id}/create-account-user`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "newAccountUser": {
          "first_name": newRelationship.first_name,
          "middle_name": newRelationship.middle_name,
          "last_name": newRelationship.last_name,
          "email": newRelationship.email ? ((newRelationship.email).toLowerCase()).replace(/\s+/g, "") : "",
          "address": newRelationship.address,
          "address2": newRelationship.address2,
          "city": newRelationship.city,
          "state": newRelationship.state,
          "zip": newRelationship.zip,
          "fax": newRelationship.fax,
          "birthday": newRelationship.birthday,
          "gender": newRelationship.gender,
          "pronouns": newRelationship.pronouns,
          "home_phone": newRelationship.home_phone,
          "avatar": newRelationship.avatar,
          "status": "active"
        },
        "permissions": [
          ...newRelationship.permissions
        ],
        "user_type": store.getState().user.benefits_data.type,
        "emergency": newRelationship.emergencyContact,
        "primary_contact": newRelationship.primary_contact,
        "secondary_contact": newRelationship.secondary_contact,
        "status": "active",
        "inherit": newRelationship.inherit,
        "account_id": account_id || store.getState().session.account_id,
        "sendEmail": newRelationship.notify,
        "creator": store.getState().user,
        target_hubspot_deal_id,
        "creation_type": "benefits"
      }
    })
    .then((newUser) => {
      if (newUser.success) {
        dispatch({ type: CREATE_NEW_RELATIONSHIP, payload: newUser.payload.new_user });
        dispatch({ type: UPDATE_LOGGEDIN_USER, payload: { ...store.getState().user, accounts: newUser.payload.new_accounts } });
        return newUser; 
      }
    })
    .catch((error) => {
      return { success: false, message: error.response.data.message };
    });
};

export const updateRelationship = (newRelationship, cognito_id) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/users/update-account-user/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "updates": {
          "first_name": newRelationship.first_name,
          "middle_name": newRelationship.middle_name,
          "last_name": newRelationship.last_name,
          "email": newRelationship.email,
          "address": newRelationship.address,
          "address2": newRelationship.address2,
          "city": newRelationship.city,
          "state": newRelationship.state,
          "zip": newRelationship.zip,
          "fax": newRelationship.fax,
          "birthday": newRelationship.birthday,
          "gender": newRelationship.gender,
          "pronouns": newRelationship.pronouns,
          "home_phone": newRelationship.home_phone,
          "avatar": newRelationship.avatar,
          "status": "active"
        },
        "permissions": [
          ...newRelationship.permissions
        ],
        cognito_id
      }
    })
    .then((newUser) => {
      if (newUser.success) {
        dispatch({ type: UPDATE_RELATIONSHIP, payload: newUser.payload });
        dispatch(getCurrentUser());

        return newUser;
      }
    })
    .catch((error) => {
      return { success: false, message: error.response.data.message };
    });
};

export const deleteRelationship = (cognito_id) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/users/delete-account-user/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        cognito_id
      }
    }).then((data) => {
      dispatch({ type: DELETE_RELATIONSHIP, payload: cognito_id });
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
    apiGateway.NAME,
    `/users/reset-user-password/${store.getState().user.cognito_id}/${store.getState().session.account_id}`,
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
