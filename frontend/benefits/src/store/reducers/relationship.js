import { LOCATION_CHANGE, CREATE_NEW_RELATIONSHIP, UPDATE_RELATIONSHIP, DELETE_RELATIONSHIP, IS_FETCHING_RELATIONSHIPS, HAS_REQUESTED_RELATIONSHIPS, GET_RELATIONSHIPS, OPEN_CREATE_RELATIONSHIP_MODAL, CLOSE_CREATE_RELATIONSHIP_MODAL, CLEAR_ALL } from "../actions/constants";

const defaultState = {
  creatingRelationship: false,
  list: [],
  defaults: {},
  account_id: null,
  requested: false,
  isFetching: false,
  current_page: 1,
  updating: false,
  viewing: false
};
const loaderReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_RELATIONSHIPS:
      return { ...state, list: payload, isFetching: false, requested: true };
    case OPEN_CREATE_RELATIONSHIP_MODAL:
      return { ...state, creatingRelationship: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing, account_id: payload.account_id };
    case CLOSE_CREATE_RELATIONSHIP_MODAL:
      return { ...state, creatingRelationship: false, defaults: {}, updating: false, viewing: false, account_id: null };
    case IS_FETCHING_RELATIONSHIPS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_RELATIONSHIPS:
      return { ...state, requested: payload };
    case CREATE_NEW_RELATIONSHIP:
      return { ...state, list: [payload, ...state.list] };
    case UPDATE_RELATIONSHIP:
      const relationships_after_update = state.list.filter((r) => r.cognito_id !== payload.cognito_id);
      return { ...state, list: [payload, ...relationships_after_update] };
    case DELETE_RELATIONSHIP:
      const relationships_after_delete = state.list.filter((r) => r.cognito_id !== payload);
      return { ...state, list: relationships_after_delete };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, creatingRelationship: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default loaderReducer;
