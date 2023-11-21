import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { updateSession } from "./session";
import { store } from "..";
import { updateUser } from "./user";
import { loadHubspotDefaults } from "../../hubspot-config";
import moment from "moment";
import {
  UPDATE_ZENDESK_STATE
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const updateHubspotContact = (hubspot_contact_id, data) => async (dispatch) => {
  if (hubspot_contact_id && !store.getState().session.updating_hubspot_contact) {
    dispatch(updateSession("updating_hubspot_contact", true));
    return API.patch(Gateway.name, `/hubspot/update-hubspot-contact/${hubspot_contact_id}`, { body: { data } })
      .then((updatedContact) => {
        if (updatedContact.created && store.getState().user) dispatch(updateUser({ hubspot_contact_id: updatedContact.payload.vid }, null, false));
        return updatedContact;
      })
      .catch((error) => {
        dispatch(updateSession("updating_hubspot_contact", false));
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      })
      .finally(() => dispatch(updateSession("updating_hubspot_contact", false)));
  }
};

export const createHubspotContact = (email, data, additional_data = []) => async (dispatch) => {
  return API.post(Gateway.name, "/hubspot/create-hubspot-contact", { body: { email, data: [...data, ...additional_data] } })
    .then((createdContact) => createdContact)
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const createOrUpdateHubspotContact = (hubspot_contact_id, data) => async (dispatch) => {
  if (hubspot_contact_id && !store.getState().session.updating_hubspot_contact) {
    dispatch(updateSession("updating_hubspot_contact", true));
    return API.patch(Gateway.name, `/hubspot/update-hubspot-contact/${hubspot_contact_id}`, { body: { data } })
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
        if (store.getState().user) dispatch(updateUser({ hubspot_contact_id: created.payload.vid }, null, false));
      })
      .catch(() => dispatch(updateSession("creating_hubspot_contact", false)))
      .finally(() => dispatch(updateSession("creating_hubspot_contact", false)));
  }
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

export const getHubspotVisitorToken = () => async (dispatch) => {
  if (!store.getState().session.fetching_visitor_token && !store.getState().session.has_fetched_visitor_token && (!store.getState().session.refresh_time || moment().isAfter(store.getState().session.refresh_time))) {
    dispatch({ type: UPDATE_ZENDESK_STATE, payload: { "fetching_visitor_token": true } });
    return API.get(
      Gateway.name,
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
        return jwt.payload;
      })
      .catch((error) => {
        dispatch({ type: UPDATE_ZENDESK_STATE, payload: { "fetching_visitor_token": false, "chat_open": false } });
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      });
  }
};

export const openHubspotChat = () => async (dispatch) => {
  dispatch({ type: UPDATE_ZENDESK_STATE, payload: { "chat_opening": true } });
  loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token)
    .then(() => {
      dispatch({ type: UPDATE_ZENDESK_STATE, payload: { "chat_open": true, chat_opening: false } });
    });
};