import {
  GET_RETAILERS,
  IS_FETCHING_RETAILERS,
  HAS_REQUESTED_RETAILERS,
  CLEAR_CLIENT_REGISTRATION,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  list: [],
  requested: false,
  isFetching: false
};
const retailerReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_RETAILERS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case IS_FETCHING_RETAILERS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_RETAILERS:
      return { ...state, requested: payload };
    case CLEAR_CLIENT_REGISTRATION:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default retailerReducer;