import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import { HAS_REQUESTED_SERVICE_REQUESTS, IS_FETCHING_REQUESTS, GET_SERVICE_REQUESTS, UPDATE_SERVICE_REQUESTS, DISPATCH_REQUEST, OPEN_REQUEST_MODAL, CLOSE_REQUEST_MODAL, OPEN_TICKET_MODAL, CLOSE_TICKET_MODAL } from "./constants";
import { showNotification } from "./notification";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const dispatchRequest = (ticket) => async (dispatch) => {
  const account = store.getState().accounts.find((account) => account.account_id === store.getState().session.account_id);
  if (!ticket.tags) ticket.tags = [];
  if (ticket.tags) {
    ticket.tags.push(ticket.request_type);
    if (account && account.type) ticket.tags.push(account.type);
  }
  return API.post(
    Gateway.name,
    `/zendesk/create-request-ticket/${store.getState().session.account_id}/${ticket.cognito_id || store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        ticket
      }
    })
    .then((request) => {
      if (request.success) {
        dispatch({ type: DISPATCH_REQUEST, payload: request.payload });
        return { success: true, payload: request.payload };
      } else {
        return { success: false, error: { message: request.message } };
      }
    }).catch((error) => {
      if (error.response) return { success: false, error: { message: error.response.data.message } };
      return { success: false, error: { message: "Something went wrong. Could not create ticket." } };
    });
};

export const updateAccountRequest = (update) => async (dispatch) => {
  const request = await API.post(
    Gateway.name,
    `/zendesk/create-request-ticket/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        ...update,
        "tags": [
          "request",
          update.request_type
        ]
      }
    });
  if (request.success) {
    dispatch({ type: DISPATCH_REQUEST, payload: request.payload });
    dispatch(showNotification("success", "Account Update Requested", "Your request to update your account was successful."));
  } else {
    dispatch(showNotification("error", "Account Update Request Failed", "Your request to update your account could not be created."));
    return { success: false, error: { message: request.message } };
  }
};

export const getRequests = (override = false) => async (dispatch) => {
  if ((!store.getState().request.isFetching && !store.getState().request.requested) || override) {
    dispatch({ type: IS_FETCHING_REQUESTS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/zendesk/get-account-requests/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_SERVICE_REQUESTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_REQUESTS, payload: false });
        return true;
      } else {
        dispatch({ type: HAS_REQUESTED_SERVICE_REQUESTS, payload: true });
        dispatch({ type: IS_FETCHING_REQUESTS, payload: false });
        return false;
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_SERVICE_REQUESTS, payload: true });
      dispatch({ type: IS_FETCHING_REQUESTS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const getTicketById = (ticket_id, current_page) => async (dispatch) => {
  const ticket = await API.get(
    Gateway.name,
    `/zendesk/get-account-request/${store.getState().session.account_id}/${store.getState().user.cognito_id}/${ticket_id}`,
    {
      headers: {
        "Authorization": store.getState().session.token
      }
    });
  if (ticket.success) {
    dispatch({ type: UPDATE_SERVICE_REQUESTS, payload: ticket.payload });
    dispatch({ type: OPEN_TICKET_MODAL, payload: { ticket: ticket.payload, current_page } });
    return ticket;
  }
  return { success: false, message: "Cannot get request ticket" };
};

export const updateTicketById = (ticket_id, updates) => async (dispatch) => {
  const updated = await API.patch(
    Gateway.name,
    `/zendesk/update-request-ticket/${store.getState().session.account_id}/${store.getState().user.cognito_id}/${ticket_id}`,
    {
      headers: {
        "Authorization": store.getState().session.token
      },
      body: {
        updates
      }
    });
    if (updated.success) dispatch({ type: UPDATE_SERVICE_REQUESTS, payload: updated.payload });
    return updated;
};

export const openTicketModal = (ticket, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_TICKET_MODAL, payload: { ticket, current_page } });
};

export const closeTicketModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_TICKET_MODAL });
};


export const openRequestModal = (type, callback, title) => async (dispatch) => {
  dispatch({ type: OPEN_REQUEST_MODAL, payload: { type, callback, title } });
  dispatch(logEvent("request", store.getState().user, "modal"));
};

export const closeRequestModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_REQUEST_MODAL });
};
