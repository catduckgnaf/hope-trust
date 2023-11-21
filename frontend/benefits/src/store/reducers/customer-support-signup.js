import {
  IS_LOGGED_IN,
  IS_REGISTERED,
  UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE,
  CLEAR_CUSTOMER_SUPPORT_SIGNUP_STATE,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = { state: {}, confirmationRequired: false, error: "", currentStep: 0, title: "" };

const partnerSignupReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE:
      return { ...state, ...payload };
    case CLEAR_CUSTOMER_SUPPORT_SIGNUP_STATE:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, error: "" };
    case IS_LOGGED_IN:
      return defaultState;
    case IS_REGISTERED:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default partnerSignupReducer;
