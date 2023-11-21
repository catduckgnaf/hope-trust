import { GET_RELATIONSHIPS, CREATE_NEW_RELATIONSHIP, UPDATE_RELATIONSHIP, DELETE_RELATIONSHIP, OPEN_CREATE_RELATIONSHIP_MODAL, CLOSE_CREATE_RELATIONSHIP_MODAL, IS_FETCHING_RELATIONSHIPS, HAS_REQUESTED_RELATIONSHIPS, CLEAR_ALL, LOCATION_CHANGE } from "../actions/constants";

const defaultState = {
  list: [],
  creatingRelationship: false,
  defaults: {},
  account_id: null,
  target_hubspot_deal_id: null,
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const loaderReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_RELATIONSHIPS:
      return { ...state, list: payload, isFetching: false, requested: true };
    case CREATE_NEW_RELATIONSHIP:
      return { ...state, list: [payload, ...state.list] };
    case UPDATE_RELATIONSHIP:
      const relationships_after_update = state.list.filter((r) => r.cognito_id !== payload.cognito_id);
      return { ...state, list: [payload, ...relationships_after_update] };
    case DELETE_RELATIONSHIP:
      const relationships_after_delete = state.list.filter((r) => r.cognito_id !== payload);
      return { ...state, list: relationships_after_delete };
    case OPEN_CREATE_RELATIONSHIP_MODAL:
      return { ...state, current_page: payload.current_page, creatingRelationship: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing, account_id: payload.account_id, target_hubspot_deal_id: payload.target_hubspot_deal_id };
    case CLOSE_CREATE_RELATIONSHIP_MODAL:
      return { ...state, creatingRelationship: false, defaults: {}, updating: false, viewing: false, account_id: null, target_hubspot_deal_id: null };
    case IS_FETCHING_RELATIONSHIPS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_RELATIONSHIPS:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default loaderReducer;
