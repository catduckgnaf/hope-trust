import {
  GET_GROUPS,
  OPEN_GROUP_MODAL,
  CLOSE_GROUP_MODAL,
  ADD_GROUP,
  DELETE_GROUP,
  EDIT_GROUP,
  IS_FETCHING_GROUPS,
  HAS_REQUESTED_GROUPS,
  LOCATION_CHANGE,
  OPEN_GROUP_CONNECTION_MODAL,
  CLOSE_GROUP_CONNECTION_MODAL,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_group_connection: false,
  viewing_group: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const groupsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_GROUPS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_GROUP:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_GROUP:
      const old_groups_before_delete = state.list;
      const new_groups_after_delete = old_groups_before_delete.filter((group) => group.id !== payload);
      return { ...state, list: new_groups_after_delete };
    case EDIT_GROUP:
      const old_groups_before_edit = state.list;
      const new_groups_after_edit = old_groups_before_edit.filter((group) => group.id !== payload.id);
      return { ...state, list: [...new_groups_after_edit, payload] };
    case OPEN_GROUP_CONNECTION_MODAL:
      return { ...state, current_page: payload.current_page, viewing_group_connection: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_GROUP_CONNECTION_MODAL:
      return { ...state, viewing_group_connection: false, defaults: {}, updating: false, viewing: false };
    case OPEN_GROUP_MODAL:
      return { ...state, current_page: payload.current_page, viewing_group: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_GROUP_MODAL:
      return { ...state, viewing_group: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_GROUPS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_GROUPS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_group: false, viewing_group_connection: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default groupsReducer;