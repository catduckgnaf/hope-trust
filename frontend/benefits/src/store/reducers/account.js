import {
  CLEAR_ALL,
  CHANGE_ACCOUNTS_TAB,
  LOCATION_CHANGE,
  OPEN_CREATE_ACCOUNT_MODAL,
  CLOSE_CREATE_ACCOUNT_MODAL
} from "../actions/constants";

const defaultState = {
  account_edit_show: false,
  active_accounts_tab: "accounts",
  defaults: {},
  type: "",
  creating_account: false,
  config: {}
};
const accountReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE:
      return { ...state, creating_account: false, is_partner_creation: false, is_user_creation: false, payment_methods_show: false };
    case CHANGE_ACCOUNTS_TAB:
      return { ...state, active_accounts_tab: payload };
    case OPEN_CREATE_ACCOUNT_MODAL:
      return { ...state, creating_account: true, config: payload };
    case CLOSE_CREATE_ACCOUNT_MODAL:
      return { ...state, creating_account: false, config: {} };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default accountReducer;
