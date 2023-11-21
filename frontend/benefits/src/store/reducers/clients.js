import {
  GET_CLIENTS,
  OPEN_CLIENT_MODAL,
  CLOSE_CLIENT_MODAL,
  ADD_CLIENT,
  DELETE_CLIENT,
  EDIT_CLIENT,
  IS_FETCHING_CLIENTS,
  HAS_REQUESTED_CLIENTS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_client: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const clientsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_CLIENTS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_CLIENT:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_CLIENT:
      const old_clients_before_delete = state.list;
      const new_clients_after_delete = old_clients_before_delete.filter((client) => client.id !== payload);
      return { ...state, list: new_clients_after_delete };
    case EDIT_CLIENT:
      const old_clients_before_edit = state.list;
      const new_clients_after_edit = old_clients_before_edit.filter((client) => client.id !== payload.id);
      return { ...state, list: [...new_clients_after_edit, payload] };
    case OPEN_CLIENT_MODAL:
      return { ...state, current_page: payload.current_page, viewing_client: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CLIENT_MODAL:
      return { ...state, viewing_client: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_CLIENTS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_CLIENTS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_client: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default clientsReducer;