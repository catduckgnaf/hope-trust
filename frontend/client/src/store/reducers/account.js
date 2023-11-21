import {
  CLEAR_ALL,
  OPEN_CREATE_ACCOUNT_MODAL,
  CLOSE_CREATE_ACCOUNT_MODAL,
  OPEN_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL,
  CLOSE_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL,
  GET_ACCOUNT_CUSTOMER,
  IS_FETCHING_CUSTOMER,
  HAS_REQUESTED_ACCOUNT_CUSTOMER,
  OPEN_ADD_NEW_USER_MODAL,
  CLOSE_ADD_NEW_USER_MODAL,
  OPEN_CREATE_RELATIONSHIP_MODAL,
  OPEN_CONVERT_TO_PARTNER_MODAL,
  OPEN_CREATE_PROVIDER_MODAL,
  OPEN_PAYMENT_METHODS_MODAL,
  CLOSE_PAYMENT_METHODS_MODAL,
  GET_ACCOUNT_SUBSCRIPTIONS,
  IS_FETCHING_SUBSCRIPTIONS,
  HAS_REQUESTED_CUSTOMER_SUBSCRIPTIONS,
  GET_ACCOUNT_TRANSACTIONS,
  HAS_REQUESTED_CUSTOMER_TRANSACTIONS,
  IS_FETCHING_TRANSACTIONS,
  CHANGE_ACCOUNTS_TAB,
  LOCATION_CHANGE,
  IS_FETCHING_ACCOUNTS,
  HAS_REQUESTED_ACCOUNTS,
  IS_SIGNING_UP,
  GET_ACCOUNTS,
  UPDATE_CURRENT_ACCOUNT
} from "../actions/constants";

const defaultState = {
  current: false,
  creating_account: false,
  is_partner_creation: false,
  is_user_creation: false,
  portal_assistance_show: false,
  add_new_user_show: false,
  isFetchingCustomer: false,
  requestedCustomer: false,
  payment_methods_show: false,
  isFetchingSubscriptions: false,
  requestedSubscriptions: false,
  isFetchingTransactions: false,
  requestedTransactions: false,
  active_accounts_tab: "accounts",
  standalone_payment_methods: false,
  show_payment_method_messaging: false,
  isFetchingAccounts: false,
  requestedAccounts: false,
  is_signing_up: false,
  defaults: {},
  type: "",
  transactions: [],
  subscriptions: {
    active: [],
    inactive: [],
    cancelled: []
  },
  customer: {
    sources: {
      data: []
    },
    usage: {}
  }
};
const accountReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_CURRENT_ACCOUNT:
      return { ...state, current: payload };
    case GET_ACCOUNTS:
      return { ...state, requestedAccounts: true, isFetchingAccounts: false };
    case IS_FETCHING_ACCOUNTS:
      return { ...state, isFetchingAccounts: payload };
    case HAS_REQUESTED_ACCOUNTS:
      return { ...state, requestedAccounts: payload };
    case GET_ACCOUNT_CUSTOMER:
      return { ...state, isFetchingCustomer: false, requestedCustomer: true, customer: { ...payload.customer, usage: payload.customer.usage } };
    case GET_ACCOUNT_SUBSCRIPTIONS:
      return { ...state, isFetchingSubscriptions: false, requestedSubscriptions: true, subscriptions: payload };
    case GET_ACCOUNT_TRANSACTIONS:
      return { ...state, isFetchingTransactions: false, requestedTransactions: true, transactions: payload };
    case OPEN_CONVERT_TO_PARTNER_MODAL:
      return { ...state, creating_account: false, is_partner_creation: false, is_user_creation: false };
    case OPEN_CREATE_ACCOUNT_MODAL:
      return { ...state, creating_account: true, is_partner_creation: payload.is_partner_creation, is_user_creation: payload.is_user_creation, portal_assistance_show: false };
    case CLOSE_CREATE_ACCOUNT_MODAL:
      return { ...state, creating_account: false, is_partner_creation: false, is_user_creation: false, is_signing_up: false };
    case OPEN_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL:
      return { ...state, portal_assistance_show: true };
    case OPEN_ADD_NEW_USER_MODAL:
      return { ...state, add_new_user_show: true };
    case CLOSE_ADD_NEW_USER_MODAL:
      return { ...state, add_new_user_show: false };
    case CLOSE_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL:
      return { ...state, portal_assistance_show: false };
    case IS_FETCHING_CUSTOMER:
      return { ...state, isFetchingCustomer: payload };
    case HAS_REQUESTED_ACCOUNT_CUSTOMER:
      return { ...state, requestedCustomer: payload };
    case LOCATION_CHANGE:
      return { ...state, creating_account: false, is_partner_creation: false, is_user_creation: false, payment_methods_show: false };
    case OPEN_CREATE_RELATIONSHIP_MODAL:
      return { ...state, add_new_user_show: false };
    case OPEN_CREATE_PROVIDER_MODAL:
      return { ...state, add_new_user_show: false };
    case OPEN_PAYMENT_METHODS_MODAL:
      return { ...state, payment_methods_show: true, standalone_payment_methods: payload.standalone_payment_methods, show_payment_method_messaging: payload.show_payment_method_messaging };
    case CLOSE_PAYMENT_METHODS_MODAL:
      return { ...state, payment_methods_show: false };
    case IS_FETCHING_SUBSCRIPTIONS:
      return { ...state, isFetchingSubscriptions: payload };
    case HAS_REQUESTED_CUSTOMER_SUBSCRIPTIONS:
      return { ...state, requestedSubscriptions: payload };
    case IS_FETCHING_TRANSACTIONS:
      return { ...state, isFetchingTransactions: payload };
    case HAS_REQUESTED_CUSTOMER_TRANSACTIONS:
      return { ...state, requestedTransactions: payload };
    case CHANGE_ACCOUNTS_TAB:
      return { ...state, active_accounts_tab: payload };
    case IS_SIGNING_UP:
      return { ...state, is_signing_up: payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default accountReducer;
