import { UPDATE_CLIENT_REGISTRATION, BULK_UPDATE_CLIENT_REGISTRATION, CLEAR_CLIENT_REGISTRATION, CLEAR_ALL, IS_LOGGED_OUT } from "../actions/constants";

const defaultState = {
  client_details: {},
  registration_config: {},
  account_details: {}
};
const clientRegistration = (state = defaultState, { type, payload }) => {
  switch (type) {
    case BULK_UPDATE_CLIENT_REGISTRATION:
      return { ...state, [payload.collector]: { ...state[payload.collector], ...payload.data } };
    case UPDATE_CLIENT_REGISTRATION:
      return { ...state, [payload.collector]: { ...state[payload.collector], [payload.key]: payload.value } };
    case CLEAR_CLIENT_REGISTRATION:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    case IS_LOGGED_OUT:
      return defaultState;
    default:
      return state;
  }
};

export default clientRegistration;
