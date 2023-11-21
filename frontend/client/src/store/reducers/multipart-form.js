import { CHANGE_FORM_SLIDE, CHANGE_STEP_COMPLETION, CLEAR_MULTI_PART_FORM, CLEAR_CLIENT_REGISTRATION, CLEAR_PARTNER_REGISTRATION, IS_LOGGED_OUT } from "../actions/constants";

const defaultState = { slide: 0, steps_status: {} };
const multiPartFormReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case CHANGE_FORM_SLIDE:
      return { ...state, slide: payload };
    case CHANGE_STEP_COMPLETION:
      return { ...state, steps_status: { ...state.steps_status, [payload.step]: payload.status } };
    case CLEAR_MULTI_PART_FORM:
      return defaultState;
    case CLEAR_PARTNER_REGISTRATION:
      return defaultState;
    case CLEAR_CLIENT_REGISTRATION:
      return defaultState;
    case IS_LOGGED_OUT:
      return defaultState;
    default:
      return state;
  }
};

export default multiPartFormReducer;
