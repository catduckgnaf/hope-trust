import { Auth, API } from "aws-amplify";
import { apiGateway } from "../../config";
import {
  IS_LOGGED_IN,
  SET_SESSION_ACCOUNT,
  IS_REGISTERED,
  ADD_USER_RECORD,
  CREATE_NEW_RELATIONSHIP
} from "./constants";
import { showNotification } from "./notification";
import { store } from "..";
import { customerServiceGetAllAccounts } from "./customer-support";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getCurrentUser = () => async (dispatch) => {
  return Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user) => {
      const token = user.signInUserSession.idToken.jwtToken;
      const storedUser = await API.get(Gateway.name, `/users/${user.username}`, { headers: { Authorization: token } });
      if (storedUser.success) {
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { token, user } });
        dispatch({ type: IS_REGISTERED, payload: storedUser.payload });
        return storedUser.payload;
      }
      return storedUser.success;
    })
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const updateUser = (updates, token, notify = true) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/users/update/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: token || store.getState().session.token
      },
      body: {
        updates
      }
    }).then((updatedUser) => {
      if (updatedUser.success) {
        dispatch({ type: IS_LOGGED_IN, payload: updatedUser.payload });
        if (notify) dispatch(showNotification("success", "Profile Updated", "Profile was successfully updated."));
        return updatedUser;
      }
    }).catch((error) => {
      dispatch(showNotification("error", "Profile Updated", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};

export const changeUserPassword = (oldPassword, newPassword) => async (dispatch) => {
  const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
  return Auth.changePassword(user, oldPassword, newPassword)
  .then((status) => {
    if (status === "SUCCESS") {
      return { success: true, message: "Password was updated."};
    }
    return { success: false, message: "Password was not updated."};
  })
  .catch((error) => {
    return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
  });
};

export const changeUserEmail = (newEmail) => async (dispatch) => {
  const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
  return Auth.updateUserAttributes(user, { email: (newEmail).toLowerCase() })
    .then((status) => {
      if (status === "SUCCESS") {
        return { success: true, message: "Email was updated." };
      }
      return { success: false, message: "Email was not updated." };
    })
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const checkUserEmail = (email = "", type) => async (dispatch) => {
  if (email) {
    email = ((email).toLowerCase()).replace(/\s+/g, "");
    return API.get(Gateway.name, `/users/check-email/${email}?type=${type}`).then((user) => {
      return user;
    }).catch((error) => {
      if (error.response) return error.response.data;
      return { success: false };
    });
  } else {
    return { success: false };
  }
};

export const checkUsername = (username) => async (dispatch) => {
  if (username) {
    username = ((username).toLowerCase()).replace(/\s+/g, "");
    return API.get(Gateway.name, `/users/check-username/${username}`).then((user) => {
      return user;
    }).catch((error) => {
      if (error.response) return error.response.data;
      return { success: false };
    });
  } else {
    return { success: false };
  }
};

export const createUserRecord = (user, create_stripe_customer, create_hubspot_contact, associated_account, pool_type) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/users/create-new-user/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        user,
        create_stripe_customer,
        create_hubspot_contact,
        associated_account,
        pool_type
      }
    }).then((data) => {
      if (data.success) {
        dispatch({ type: ADD_USER_RECORD, payload: data.payload });
        dispatch(customerServiceGetAllAccounts(true));
      }
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const createRelationship = (newRelationship, account_id, target_hubspot_deal_id = false) => async (dispatch) => {
  return API.post(
    Gateway.name,
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
        "user_type": newRelationship.user_type,
        "emergency": newRelationship.emergencyContact,
        "primary_contact": newRelationship.primary_contact,
        "secondary_contact": newRelationship.secondary_contact,
        "status": "active",
        "inherit": newRelationship.inherit,
        "account_id": account_id || store.getState().session.account_id,
        "sendEmail": newRelationship.notify,
        "creator": store.getState().user,
        target_hubspot_deal_id
      }
    })
    .then((newUser) => {
      if (newUser.success) {
        dispatch({ type: CREATE_NEW_RELATIONSHIP, payload: newUser.payload.new_user });
        return newUser;
      }
    })
    .catch((error) => {
      return { success: false, message: error.response.data.message };
    });
};

export const createHubspotContact = (email, data, additional_data = []) => async (dispatch) => {
  return API.post(Gateway.name, "/hubspot/create-hubspot-contact", { body: { email, data: [...data, ...additional_data] } })
    .then((createdContact) => createdContact)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};
export const createHubspotDeal = (data) => async (dispatch) => {
  return API.post(Gateway.name, "/hubspot/create-hubspot-deal", { body: { data } })
    .then((updatedDeal) => updatedDeal)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const updateHubspotDeal = (id, data) => async (dispatch) => {
  return API.patch(Gateway.name, `/hubspot/update-hubspot-deal/${id}`, { body: { data } })
    .then((updatedDeal) => updatedDeal)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const addContactToCompany = (contact_id, company_id) => async (dispatch) => {
  return API.post(Gateway.name, "/hubspot/add-contact-to-company", { body: { contact_id, company_id } })
    .then((addedContact) => addedContact)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const createHubspotCompany = (name, type, domain_approved, email, cognito_id) => async (dispatch) => {
  return API.post(Gateway.name, `/hubspot/create-hubspot-company/${cognito_id || store.getState().user.cognito_id}`, { body: { email, domain_approved, name, type, data: [{ name: "name", value: name }, { value: (process.env.REACT_APP_STAGE || "development"), name: "environment" },] } })
    .then((newCompany) => newCompany)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};