import {
  GET_TICKETS,
  ADD_TICKET,
  DELETE_TICKET,
  EDIT_TICKET,
  IS_FETCHING_TICKETS,
  HAS_REQUESTED_TICKETS,
  OPEN_TICKET_MODAL,
  DELETE_TICKETS,
  CLOSE_TICKET_MODAL
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { customerServiceGetAllPartners } from "./customer-support";
import { store } from "..";
import { showNotification } from "./notification";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getTickets = (override = false) => async (dispatch) => {
  if ((!store.getState().groups.isFetching && !store.getState().groups.requested) || override) {
    dispatch({ type: IS_FETCHING_TICKETS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/tickets/get-tickets/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_TICKETS, payload: data.payload });
        dispatch({ type: IS_FETCHING_TICKETS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_TICKETS, payload: true });
        dispatch({ type: IS_FETCHING_TICKETS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_TICKETS, payload: [] });
      dispatch({ type: HAS_REQUESTED_TICKETS, payload: true });
      dispatch({ type: IS_FETCHING_TICKETS, payload: false });
      return { success: false };
    }
  }
};
export const getTicket = (ID) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/tickets/get-ticket/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      dispatch({ type: EDIT_TICKET, payload: data.payload });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const createTicket = (ticket) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/tickets/create-ticket/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        ticket
      }
    }).then((data) => {
      dispatch({ type: ADD_TICKET, payload: data.payload });
      if (data.success && data.payload.request_type === "domain_approval") dispatch(customerServiceGetAllPartners(true));
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateTicket = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/tickets/update-ticket/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: EDIT_TICKET, payload: data.payload });
      if (data.success && data.payload.request_type === "domain_approval") customerServiceGetAllPartners(true);
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteTicket = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_TICKET, payload: ID });
  return API.del(
    Gateway.name,
    `/tickets/delete-ticket/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const deleteTickets = (ticket_ids) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/tickets/delete-tickets/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        ticket_ids
      }
    }).then((data) => {
      if (data.payload.failed) dispatch(showNotification("error", "Delete Failed", `Could not delete ${data.payload.failed.length} of ${ticket_ids.length} ${ticket_ids.length === 1 ? "ticket" : "tickets"}.`));
      else dispatch(showNotification("success", "Records Deleted", `Successfully deleted ${data.payload.success.length} of ${ticket_ids.length} ${ticket_ids.length === 1 ? "ticket" : "tickets"}.`));
      dispatch({ type: DELETE_TICKETS, payload: data.payload.success });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const openCreateTicketModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_TICKET_MODAL, payload: { defaults, updating, viewing, current_page }});
};

export const closeCreateTicketModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_TICKET_MODAL });
};