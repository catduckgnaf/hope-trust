import { Auth, API } from "aws-amplify";
import { apiGateway } from "../../config";
import { UPDATE_RELATIONSHIP, IS_LOGGED_IN, SET_SESSION_ACCOUNT, IS_REGISTERED } from "./constants";
import { showNotification } from "./notification";
import { updateSession } from "./session";
import { store } from "..";

export const getCurrentUser = () => async (dispatch) => {
  return Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user) => {
      const token = user.signInUserSession.idToken.jwtToken;
      const storedUser = await API.get(apiGateway.NAME, `/users/${user.username}`, { headers: { Authorization: token } });
      if (storedUser.success) {
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { token, user } });
        dispatch({ type: IS_REGISTERED, payload: storedUser.payload });
      }
    })
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const createHubspotContact = (email, data, additional_data = []) => async (dispatch) => {
  return API.post(apiGateway.NAME, "/hubspot/create-hubspot-contact", { body: { email, data: [...data, ...additional_data ] } })
    .then((createdContact) => createdContact)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const updateUser = (updates, token, notify = true) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
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
        dispatch({ type: UPDATE_RELATIONSHIP, payload: updatedUser.payload });
        if (notify) dispatch(showNotification("success", "Profile Updated", "Profile was successfully updated."));
        return updatedUser;
      }
    }).catch((error) => {
      if (notify) dispatch(showNotification("error", "Profile Updated", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};

export const updateHubspotContact = (hubspot_contact_id, data) => async (dispatch) => {
  if (hubspot_contact_id && !store.getState().session.updating_hubspot_contact) {
    dispatch(updateSession("updating_hubspot_contact", true));
    return API.patch(apiGateway.NAME, `/hubspot/update-hubspot-contact/${hubspot_contact_id}`, { body: { data } })
      .then((updatedContact) => {
        if (updatedContact.created) dispatch(updateUser({ hubspot_contact_id: updatedContact.payload.vid }, null, false));
        return updatedContact;
      })
      .catch((error) => {
        dispatch(updateSession("updating_hubspot_contact", false));
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      })
      .finally(() => dispatch(updateSession("updating_hubspot_contact", false)));
  }
};

export const createOrUpdateHubspotContact = (hubspot_contact_id, data) => async (dispatch) => {
  if (hubspot_contact_id && !store.getState().session.updating_hubspot_contact) {
    dispatch(updateSession("updating_hubspot_contact", true));
    return API.patch(apiGateway.NAME, `/hubspot/update-hubspot-contact/${hubspot_contact_id}`, { body: { data } })
      .then((updatedContact) => updatedContact)
      .catch((error) => {
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      })
      .finally(() => dispatch(updateSession("updating_hubspot_contact", false)));
  } else if (!store.getState().session.creating_hubspot_contact) {
    dispatch(updateSession("creating_hubspot_contact", true));
    return dispatch(createHubspotContact(store.getState().user.email, [
      ...data,
      { "property": "tag", "value": store.getState().user.is_partner ? "B2B" : "B2C" },
      { "property": "hubspot_owner_id", "value": "111461965" },
      { "property": "hs_lead_status", "value": "CUSTOMER" },
      { "property": "form_lead_source", "value": "legacy" },
      { "property": "sign_up_status", "value": "Done" },
    ]))
      .then((created) => {
        dispatch(updateUser({ hubspot_contact_id: created.payload.vid }, null, false));
      })
      .catch(() => dispatch(updateSession("creating_hubspot_contact", false)))
      .finally(() => dispatch(updateSession("creating_hubspot_contact", false)));
  }
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
    return API.get(apiGateway.NAME, `/users/check-email/${email}?type=${type}`).then((user) => {
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
    return API.get(apiGateway.NAME, `/users/check-username/${username}`).then((user) => {
      return user;
    }).catch((error) => {
      if (error.response) return error.response.data;
      return { success: false };
    });
  } else {
    return { success: false };
  }
};

export const createHubspotDeal = (data) => async (dispatch) => {
  return API.post(apiGateway.NAME, "/hubspot/create-hubspot-deal", { body: { data } })
    .then((updatedDeal) => updatedDeal)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const updateHubspotDeal = (id, data) => async (dispatch) => {
  return API.patch(apiGateway.NAME, `/hubspot/update-hubspot-deal/${id}`, { body: { data } })
    .then((updatedDeal) => updatedDeal)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const addContactToCompany = (contact_id, company_id) => async (dispatch) => {
  return API.post(apiGateway.NAME, "/hubspot/add-contact-to-company", { body: { contact_id, company_id } })
    .then((addedContact) => addedContact)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const createHubspotCompany = (name, type, domain_approved, email, cognito_id) => async (dispatch) => {
  return API.post(apiGateway.NAME, `/hubspot/create-hubspot-company/${cognito_id || store.getState().user.cognito_id}`, { body: { email, domain_approved, name, type, data: [{ name: "name", value: name }, { value: (process.env.REACT_APP_STAGE || "development"), name: "environment" },] } })
    .then((newCompany) => newCompany)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};