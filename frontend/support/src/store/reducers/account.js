import {
  CLEAR_ALL,
  CHANGE_ACCOUNTS_TAB,
  OPEN_ACCOUNT_UPDATE_MODAL,
  CLOSE_ACCOUNT_UPDATE_MODAL,
  OPEN_CREATE_ACCOUNT_MODAL,
  CLOSE_CREATE_ACCOUNT_MODAL,
  LOCATION_CHANGE,
  CHANGE_CUSTOMER_SUPPORT_ACCOUNTS_TAB,
  OPEN_ADD_MEMBERSHIP_MODAL
} from "../actions/constants";

const defaultState = {
  account_edit_show: false,
  current_page: 1,
  active_accounts_tab: "accounts",
  creating_account: false,
  defaults: {},
  config: {},
  type: ""
};
const accountReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE:
      return { ...state, account_edit_show: false, creating_account: false, current_page: 1, defaults: {} };
    case OPEN_ACCOUNT_UPDATE_MODAL:
      return { ...state, account_edit_show: true, defaults: payload.defaults, type: payload.type, current_page: payload.current_page };
    case CLOSE_ACCOUNT_UPDATE_MODAL:
      return { ...state, account_edit_show: false, defaults: {} };
    case OPEN_CREATE_ACCOUNT_MODAL:
      return { ...state, creating_account: true, config: payload };
    case CLOSE_CREATE_ACCOUNT_MODAL:
      return { ...state, creating_account: false, config: {} };
    case OPEN_ADD_MEMBERSHIP_MODAL:
      return { ...state, creating_account: false, config: {} };
    case CHANGE_ACCOUNTS_TAB:
      return { ...state, active_accounts_tab: payload, current_page: 1 };
    case CHANGE_CUSTOMER_SUPPORT_ACCOUNTS_TAB:
      return { ...state, account_edit_show: false, defaults: {}, current_page: 1 };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default accountReducer;
