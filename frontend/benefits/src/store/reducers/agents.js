import {
  GET_AGENTS,
  IS_FETCHING_AGENTS,
  HAS_REQUESTED_AGENTS,
  CLEAR_CLIENT_REGISTRATION,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  list: [],
  requested: false,
  isFetching: false
};
const agentsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_AGENTS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case IS_FETCHING_AGENTS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_AGENTS:
      return { ...state, requested: payload };
    case CLEAR_CLIENT_REGISTRATION:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default agentsReducer;