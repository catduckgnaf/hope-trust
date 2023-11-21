import {
  GET_WHOLESALERS,
  OPEN_WHOLESALE_MODAL,
  CLOSE_WHOLESALE_MODAL,
  ADD_WHOLESALER,
  DELETE_WHOLESALER,
  EDIT_WHOLESALER,
  IS_FETCHING_WHOLESALERS,
  HAS_REQUESTED_WHOLESALERS,
  LOCATION_CHANGE,
  OPEN_WHOLESALE_CONNECTION_MODAL,
  CLOSE_WHOLESALE_CONNECTION_MODAL,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_wholesale_connection: false,
  viewing_wholesaler: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const wholesalReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_WHOLESALERS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_WHOLESALER:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_WHOLESALER:
      const old_wholesalers_before_delete = state.list;
      const new_wholesalers_after_delete = old_wholesalers_before_delete.filter((wholesaler) => wholesaler.id !== payload);
      return { ...state, list: new_wholesalers_after_delete };
    case EDIT_WHOLESALER:
      const old_wholesalers_before_edit = state.list;
      const new_wholesalers_after_edit = old_wholesalers_before_edit.filter((wholesaler) => wholesaler.id !== payload.id);
      return { ...state, list: [...new_wholesalers_after_edit, payload] };
    case OPEN_WHOLESALE_MODAL:
      return { ...state, current_page: payload.current_page, viewing_wholesaler: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_WHOLESALE_MODAL:
      return { ...state, viewing_wholesaler: false, defaults: {}, updating: false, viewing: false };
    case OPEN_WHOLESALE_CONNECTION_MODAL:
      return { ...state, current_page: payload.current_page, viewing_wholesale_connection: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_WHOLESALE_CONNECTION_MODAL:
      return { ...state, viewing_wholesale_connection: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_WHOLESALERS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_WHOLESALERS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_wholesaler: false, viewing_wholesale_connection: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default wholesalReducer;