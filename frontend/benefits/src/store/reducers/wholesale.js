import {
  GET_WHOLESALERS,
  IS_FETCHING_WHOLESALERS,
  HAS_REQUESTED_WHOLESALERS,
  CLEAR_CLIENT_REGISTRATION,
  GET_WHOLESALE_APPROVALS,
  IS_FETCHING_WHOLESALE_APPROVALS,
  HAS_REQUESTED_WHOLESALE_APPROVALS,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  wholesale_approvals: [],
  list: [],
  requested: false,
  isFetching: false,
  isFetchingWholesaleApprovals: false,
  requestedWholesaleApprovals: false
};
const wholesalReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_WHOLESALERS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case GET_WHOLESALE_APPROVALS:
      return { ...state, wholesale_approvals: payload, isFetchingWholesaleApprovals: false, requestedWholesaleApprovals: true };
    case IS_FETCHING_WHOLESALERS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_WHOLESALERS:
      return { ...state, requested: payload };
    case IS_FETCHING_WHOLESALE_APPROVALS:
      return { ...state, isFetchingWholesaleApprovals: payload };
    case HAS_REQUESTED_WHOLESALE_APPROVALS:
      return { ...state, requestedWholesaleApprovals: payload };
    case CLEAR_CLIENT_REGISTRATION:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default wholesalReducer;