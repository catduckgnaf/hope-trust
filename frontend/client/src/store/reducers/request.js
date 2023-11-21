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
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = { current_page: 1, isFetching: false, requested: false, show: false, tickets: [], type: "", callback: {}, title: "", focus: {}, viewingTicket: false };
const requestReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_SERVICE_REQUESTS:
      return { ...state, tickets: payload, requested: true, isFetching: false };
    case UPDATE_SERVICE_REQUESTS:
      let filteredTickets = state.tickets.filter((ticket) => ticket.id !== payload.id);
      return { ...state, tickets: [...filteredTickets, payload], focus: payload };
    case DISPATCH_REQUEST:
      return { ...defaultState, tickets: [payload, ...state.tickets ] };
    case OPEN_TICKET_MODAL:
      return {...state, focus: payload.ticket, viewingTicket: true, current_page: payload.current_page };
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
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, show: false, type: "", callback: {}, title: "", focus: {}, viewingTicket: false, isFetching: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default requestReducer;
