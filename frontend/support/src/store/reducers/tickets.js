import {
  GET_TICKETS,
  OPEN_TICKET_MODAL,
  CLOSE_TICKET_MODAL,
  ADD_TICKET,
  DELETE_TICKET,
  DELETE_TICKETS,
  EDIT_TICKET,
  IS_FETCHING_TICKETS,
  HAS_REQUESTED_TICKETS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_ticket: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const ticketsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_TICKETS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_TICKET:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_TICKET:
      const old_tickets_before_delete = state.list;
      const new_tickets_after_delete = old_tickets_before_delete.filter((ticket) => ticket.id !== payload);
      return { ...state, list: new_tickets_after_delete };
    case DELETE_TICKETS:
      const old_bulk_tickets_before_delete = state.list;
      const new_bulk_tickets_after_delete = old_bulk_tickets_before_delete.filter((ticket) => !payload.includes(ticket.id));
      return { ...state, list: new_bulk_tickets_after_delete };
    case EDIT_TICKET:
      const old_tickets_before_edit = state.list;
      const new_tickets_after_edit = old_tickets_before_edit.filter((ticket) => ticket.id !== payload.id);
      return { ...state, list: [payload, ...new_tickets_after_edit] };
    case OPEN_TICKET_MODAL:
      return { ...state, current_page: payload.current_page, viewing_ticket: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_TICKET_MODAL:
      return { ...state, viewing_ticket: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_TICKETS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_TICKETS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_ticket: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default ticketsReducer;