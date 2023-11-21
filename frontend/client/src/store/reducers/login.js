import {
  IS_LOGGING_IN,
  BULK_UPDATE_LOGIN,
  LOCATION_CHANGE,
  UPDATE_LOGIN,
  CLEAR_LOGIN,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  is_logging_in: false,
  flow: "login",
  login_details: {
    auto_login: false
  },
  forgot_details: {},
  force_details: {},
  mfa_details: {},
  reset_details: {},
  resolve_details: {},
  preserved_details: {}
};
const loginReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case BULK_UPDATE_LOGIN:
      if (payload.collector) return { ...state, [payload.collector]: { ...state[payload.collector], ...payload.data } };
      return { ...state, ...payload.data };
    case UPDATE_LOGIN:
      if (payload.collector) return { ...state, [payload.collector]: { ...state[payload.collector], [payload.key]: payload.value } };
      return { ...state, [payload.key]: payload.value };
    case CLEAR_LOGIN:
      return { ...defaultState, login_details: { ...state.login_details, login_email: state.login_details.login_email }, preserved_details: state.preserved_details };
    case IS_LOGGING_IN:
      return { ...state, is_logging_in: payload };
    case LOCATION_CHANGE:
      return { ...defaultState };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default loginReducer;
