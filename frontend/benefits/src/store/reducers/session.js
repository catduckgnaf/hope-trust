import {
  SET_SESSION_ACCOUNT,
  UPDATE_SESSION,
  UPDATE_ZENDESK_STATE,
  IS_FETCHING_ALL,
  HAS_FETCHED_ALL,
  IS_IDLE,
  IS_ACTIVE,
  OPEN_INSTALL_PROMPT_MODAL,
  CLOSE_INSTALL_PROMPT_MODAL,
  UPDATE_APPLICATION_STATUS,
  OPEN_CREATE_ACCOUNT_MODAL,
  OPEN_PARTNER_LOGO_MODAL,
  CLOSE_PARTNER_LOGO_MODAL,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  account_id: null,
  token: null,
  user: {},
  idle_should_prompt: false,
  has_fetched_all: false,
  is_fetching_all: false,
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
    refresh_time: null,
    unread: 0
  },
  updating_hubspot_contact: false,
  creating_hubspot_contact: false,
  application_status: {},
  install_prompt_open: false,
  is_uploading_logo: false
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
    case IS_ACTIVE:
      return { ...state, active: true };
    case IS_FETCHING_ALL:
      return { ...state, has_fetched_all: false, is_fetching_all: true };
    case HAS_FETCHED_ALL:
      return { ...state, has_fetched_all: true, is_fetching_all: false };
    case OPEN_INSTALL_PROMPT_MODAL:
      return { ...state, install_prompt_open: true };
    case CLOSE_INSTALL_PROMPT_MODAL:
      return { ...state, install_prompt_open: false };
    case OPEN_CREATE_ACCOUNT_MODAL:
      return { ...state, is_resetting: false };
    case OPEN_PARTNER_LOGO_MODAL:
      return { ...state, is_uploading_logo: true };
    case CLOSE_PARTNER_LOGO_MODAL:
      return { ...state, is_uploading_logo: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default sessionReducer;
