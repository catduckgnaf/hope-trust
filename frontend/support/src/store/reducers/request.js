import {
  GET_SERVICE_REQUESTS,
  UPDATE_SERVICE_REQUESTS,
  DISPATCH_REQUEST,
  OPEN_REQUEST_MODAL,
  CLOSE_REQUEST_MODAL,
  OPEN_TICKET_MODAL,
  CLOSE_TICKET_MODAL,
  IS_FETCHING_REQUESTS,
  HAS_REQUESTED_SERVICE_REQUESTS,
  CLEAR_ALL
} from "../actions/constants";
import { compare } from "../../utilities";

const defaultState = { isFetching: false, requested: false, show: false, tickets: [], type: "", callback: {}, title: "", focus: {}, viewingTicket: false };
const requestReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_SERVICE_REQUESTS:
      const tickets = compare(state.tickets, payload);
      return { ...state, tickets, requested: true, isFetching: false };
    case UPDATE_SERVICE_REQUESTS:
      let filteredTickets = state.tickets.filter((ticket) => ticket.zendesk_ticket_id !== payload.zendesk_ticket_id);
      return { ...state, tickets: [...filteredTickets, payload], focus: payload };
    case DISPATCH_REQUEST:
      return { ...defaultState, tickets: [payload, ...state.tickets ] };
    case OPEN_TICKET_MODAL:
      return {...state, focus: payload, viewingTicket: true };
    case CLOSE_TICKET_MODAL:
      return {...state, focus: {}, viewingTicket: false };
    case OPEN_REQUEST_MODAL:
      return { ...state, show: true, type: payload.type, callback: payload.callback, title: payload.title, tickets: state.tickets, viewingTicket: false };
    case CLOSE_REQUEST_MODAL:
      return { ...state, show: false };
    case IS_FETCHING_REQUESTS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_SERVICE_REQUESTS:
        return { ...state, requested: payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default requestReducer;
