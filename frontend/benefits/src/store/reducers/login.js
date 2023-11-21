import { IS_LOGGING_IN, CLEAR_ALL } from "../actions/constants";

const defaultState = { is_logging_in: false };
const loginReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case IS_LOGGING_IN:
      return { ...state, is_logging_in: payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default loginReducer;
