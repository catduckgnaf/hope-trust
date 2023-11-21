import {
  IS_LOGGED_IN,
  IS_REGISTERED,
  UPDATE_SIGNUP_STATE,
  CLEAR_SIGNUP_STATE,
  LOCATION_CHANGE,
  CLOSE_CREATE_ACCOUNT_MODAL,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = { state: {}, confirmationRequired: false, error: "", currentStep: 0 };

const signupReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_SIGNUP_STATE:
      let new_payload = payload;
      let newState = { ...state.state };
      if (new_payload.additional_state) newState = { ...newState, ...new_payload.additional_state };
      delete new_payload.additional_state;
      return { ...state, state: newState, ...new_payload };
    case CLEAR_SIGNUP_STATE:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, error: "" };
    case IS_LOGGED_IN:
      return defaultState;
    case IS_REGISTERED:
      return defaultState;
    case CLOSE_CREATE_ACCOUNT_MODAL:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default signupReducer;