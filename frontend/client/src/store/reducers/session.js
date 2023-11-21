import {
  SET_SESSION_ACCOUNT,
  UPDATE_SESSION,
  UPDATE_ZENDESK_STATE,
  IS_IDLE,
  IS_ACTIVE,
  OPEN_INSTALL_PROMPT_MODAL,
  CLOSE_INSTALL_PROMPT_MODAL,
  UPDATE_APPLICATION_STATUS,
  IS_SWITCHING,
  OPEN_CONVERT_TO_PARTNER_MODAL,
  OPEN_CREATE_ACCOUNT_MODAL,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  account_id: null,
  token: null,
  user: {},
  idle_should_prompt: false,
  idle_message: "",
  seconds: 60,
  idle: false,
  active: false,
  is_switching: false,
  primary_account_id: null,
  is_resetting: false,
  zendesk: {
    hubspot_visitor_token: null,
    fetching_visitor_token: false,
    has_fetched_visitor_token: false,
    chat_open: false,
    chat_opening: false,
    refresh_time: null,
    unread: 0
  },
  updating_hubspot_contact: false,
  creating_hubspot_contact: false,
  application_status: {},
  install_prompt_open: false
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
    case UPDATE_SESSION:
      return { ...state, ...payload };
    case UPDATE_ZENDESK_STATE:
      return { ...state, zendesk: { ...state.zendesk, ...payload } };
    case UPDATE_APPLICATION_STATUS:
      return { ...state, application_status: payload };
    case IS_IDLE:
      return { ...state, idle_should_prompt: true, idle: true, active: false, seconds: payload.seconds, idle_message: payload.idle_message };
    case IS_SWITCHING:
      return { ...state, is_switching: payload.is_switching, primary_account_id: payload.primary_account_id };
    case IS_ACTIVE:
      return { ...state, active: true };
    case OPEN_INSTALL_PROMPT_MODAL:
      return { ...state, install_prompt_open: true };
    case CLOSE_INSTALL_PROMPT_MODAL:
      return { ...state, install_prompt_open: false };
    case OPEN_CONVERT_TO_PARTNER_MODAL:
      return { ...state, is_resetting: false };
    case OPEN_CREATE_ACCOUNT_MODAL:
      return { ...state, is_resetting: false };
    case LOCATION_CHANGE:
      return { ...state, zendesk: { ...state.zendesk, chat_open: false } };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default sessionReducer;
