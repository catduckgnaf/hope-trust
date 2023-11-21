import { BULK_UPDATE_PARTNER_REGISTRATION, UPDATE_PARTNER_REGISTRATION, CLEAR_PARTNER_REGISTRATION, IS_LOGGED_OUT } from "../actions/constants";

const defaultState = {
  client_details: {},
  partner_details: {},
  registration_config: {},
  account_details: {}
};
const partnerRegistration = (state = defaultState, { type, payload }) => {
  switch (type) {
    case BULK_UPDATE_PARTNER_REGISTRATION:
      return { ...state, [payload.collector]: { ...state[payload.collector], ...payload.data } };
    case UPDATE_PARTNER_REGISTRATION:
      return { ...state, [payload.collector]: { ...state[payload.collector], [payload.key]: payload.value } };
    case CLEAR_PARTNER_REGISTRATION:
      return defaultState;
    case IS_LOGGED_OUT:
      return defaultState;
    default:
      return state;
  }
};

export default partnerRegistration;
