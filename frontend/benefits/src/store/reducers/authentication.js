import { IS_LOGGED_OUT, UPDATE_LOGGEDIN_USER, IS_LOGGED_IN, IS_REGISTERED, CLEAR_ALL } from "../actions/constants";
import { compare } from "../../utilities";

const defaultState = false;
const authenticationReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_LOGGEDIN_USER:
      return { ...state, ...payload };
    case IS_LOGGED_IN:
      return compare(state, payload);
    case IS_REGISTERED:
      return payload;
    case IS_LOGGED_OUT:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default authenticationReducer;
