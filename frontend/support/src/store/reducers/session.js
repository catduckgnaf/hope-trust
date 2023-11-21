import {
  SET_SESSION_ACCOUNT,
  IS_IDLE,
  IS_ACTIVE,
  OPEN_INSTALL_PROMPT_MODAL,
  CLOSE_INSTALL_PROMPT_MODAL,
  UPDATE_APPLICATION_STATUS,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  account_id: null,
  token: null,
  user: {},
  idle: false,
  active: false,
  primary_account_id: null,
  is_resetting: false,
  application_status: {},
  install_prompt_open: false,
  idle_should_prompt: false
};
const sessionReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case SET_SESSION_ACCOUNT:
      return {
        ...state,
        ...payload,
        active: true,
        idle: false,
        idle_should_prompt: false
      };
    case UPDATE_APPLICATION_STATUS:
      return { ...state, application_status: payload };
    case IS_IDLE:
      return { ...state, idle_should_prompt: true, idle: true, active: false, seconds: payload.seconds, idle_message: payload.idle_message };
    case IS_ACTIVE:
      return { ...state, active: true };
    case OPEN_INSTALL_PROMPT_MODAL:
      return { ...state, install_prompt_open: true };
    case CLOSE_INSTALL_PROMPT_MODAL:
      return { ...state, install_prompt_open: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default sessionReducer;
