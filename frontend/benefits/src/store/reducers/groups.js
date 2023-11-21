import {
  GET_GROUPS,
  OPEN_GROUP_MODAL,
  CLOSE_GROUP_MODAL,
  IS_FETCHING_GROUPS,
  HAS_REQUESTED_GROUPS,
  CLEAR_CLIENT_REGISTRATION,
  GET_GROUP_APPROVALS,
  IS_FETCHING_GROUP_APPROVALS,
  HAS_REQUESTED_GROUP_APPROVALS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_group: false,
  group_approvals: [],
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  isFetchingGroupApprovals: false,
  requestedGroupApprovals: false
};
const groupsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_GROUPS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case GET_GROUP_APPROVALS:
      return { ...state, group_approvals: payload, isFetchingGroupApprovals: false, requestedGroupApprovals: true };
    case OPEN_GROUP_MODAL:
      return { ...state, viewing_group: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_GROUP_MODAL:
      return { ...state, viewing_group: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_GROUPS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_GROUPS:
      return { ...state, requested: payload };
    case IS_FETCHING_GROUP_APPROVALS:
      return { ...state, isFetchingGroupApprovals: payload };
    case HAS_REQUESTED_GROUP_APPROVALS:
      return { ...state, requestedGroupApprovals: payload };
    case LOCATION_CHANGE:
      return { ...state, viewing_group: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_CLIENT_REGISTRATION:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default groupsReducer;