import {
  CHANGE_CUSTOMER_SUPPORT_SETTINGS_TAB,
  CHANGE_CUSTOMER_SUPPORT_ACCOUNTS_TAB,
  CHANGE_CUSTOMER_SUPPORT_PLANS_TAB,
  CHANGE_CUSTOMER_SUPPORT_BENEFITS_TAB,
  CHANGE_CUSTOMER_SUPPORT_BENEFITS_APPROVAL_TAB,
  GET_ALL_ACCOUNTS,
  GET_ALL_PARTNERS,
  GET_ALL_USERS,
  IS_FETCHING_ALL_ACCOUNTS,
  HAS_REQUESTED_ALL_ACCOUNTS,
  IS_FETCHING_ALL_PARTNERS,
  HAS_REQUESTED_ALL_PARTNERS,
  CLEAR_CUSTOMER_SUPPORT,
  UPDATE_ACCOUNT_RECORD,
  UPDATE_PARTNER_ACCOUNT_RECORD,
  GET_ALL_ACCOUNT_TRANSACTIONS,
  IS_FETCHING_ALL_TRANSACTIONS,
  HAS_REQUESTED_ALL_TRANSACTIONS,
  IS_FETCHING_CORE_SETTINGS,
  IS_FETCHING_ALL_USERS,
  HAS_REQUESTED_ALL_USERS,
  HAS_REQUESTED_CORE_SETTINGS,
  CHANGE_CUSTOMER_SUPPORT_CORE_SETTINGS_TAB,
  CHANGE_CUSTOMER_SUPPORT_LEADS_TAB,
  UPDATE_REFRESH_STATE,
  GET_CORE_SETTINGS,
  UPDATE_CORE_SETTINGS,
  UPDATE_APP_VERSION,
  GET_USER_RECORD,
  UPDATE_USER_RECORD,
  OPEN_USER_UPDATE_MODAL,
  CLOSE_USER_UPDATE_MODAL,
  LOCATION_CHANGE,
  OPEN_ADD_MEMBERSHIP_MODAL,
  CLOSE_ADD_MEMBERSHIP_MODAL,
  GET_ALL_CS_USERS,
  IS_FETCHING_CS_USERS,
  HAS_REQUESTED_ALL_CS_USERS,
  ADD_USER_RECORD,
  UPDATE_DAILY_LOGINS,
  IS_FETCHING_DAILY_LOGINS,
  HAS_REQUESTED_DAILY_LOGINS,
  IS_FETCHING_PENDING_APPROVALS,
  GET_PENDING_APPROVALS,
  HAS_REQUESTED_PENDING_APPROVALS,
  GET_GROUP_APPROVALS,
  IS_FETCHING_GROUP_APPROVALS,
  HAS_REQUESTED_GROUP_APPROVALS,
  GET_WHOLESALE_APPROVALS,
  IS_FETCHING_WHOLESALE_APPROVALS,
  HAS_REQUESTED_WHOLESALE_APPROVALS,
  GET_BENEFITS_CONFIGS,
  IS_FETCHING_BENEFITS_CONFIGS,
  HAS_REQUESTED_BENEFITS_CONFIGS,
  UPDATE_BENEFITS_CONFIG,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  is_refreshing: false,
  membership_type: "client",
  accounts: [],
  partners: [],
  users: [],
  cs_users: [],
  transactions: [],
  benefits_configs: [],
  isFetchingBenefitsConfigs: false,
  requestedBenefitsConfigs: false,
  isFetchingDailyLogins: false,
  requestedDailyLogins: false,
  requestedPendingApprovals: false,
  isFetchingPendingApprovals: false,
  requestedGroupApprovals: false,
  isFetchingGroupApprovals: false,
  requestedWholesaleApprovals: false,
  isFetchingWholesaleApprovals: false,
  logins: 0,
  previous_logins: 0,
  isFetching: false,
  requested: false,
  isFetchingPartners: false,
  user_update_modal_open: false,
  user_defaults: {},
  updating: false,
  requestedPartners: false,
  isFetchingAllTransactions: false,
  requestedAllTransactions: false,
  isFetchingAllUsers: false,
  requestedAllUsers: false,
  isFetchingCSUsers: false,
  requestedCSUsers: false,
  current_page: 1,
  active_tab: "referral-config",
  active_accounts_tab: "user-accounts",
  active_plan_tab: "user-plan-config",
  active_benefits_tab: "approval-config",
  active_lead_tab: "b2c-config",
  active_core_settings_tab: "maintenance",
  is_super_admin: false,
  isFetchingCoreSettings: false,
  requestedCoreSettings: false,
  has_updated_core_version: false,
  creating_new_membership: false,
  core_settings: {
    support_app_version: 0,
    incoming_support_app_version: 0,
    document_types: [],
    email_signature_identifiers: [],
    asset_types: [],
    income_types: [],
    budget_categories: [],
    benefit_types: [],
    contact_types: []
  },
  requires_refresh: false,
  active_benefits_approval_tab: "wholesale-approval",
  wholesale_approvals: [],
  group_approvals: [],
  pending_approvals: []
};
const customerSupportReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ALL_ACCOUNTS:
      return { ...state, accounts: payload, isFetching: false, requested: true };
    case GET_BENEFITS_CONFIGS:
      return { ...state, benefits_configs: payload, isFetchingBenefitsConfigs: false, requestedBenefitsConfigs: true };
    case UPDATE_BENEFITS_CONFIG:
      const old_benefits_configs_before_edit = state.benefits_configs;
      const new_benefits_configs_after_edit = old_benefits_configs_before_edit.filter((config) => config.id !== payload.id);
      const updated_config = old_benefits_configs_before_edit.find((config) => config.id === payload.id);
      return { ...state, benefits_configs: [...new_benefits_configs_after_edit, { ...updated_config, ...payload }] };
    case GET_PENDING_APPROVALS:
      return { ...state, pending_approvals: payload, isFetchingPendingApprovals: false, requestedPendingApprovals: true };
    case GET_GROUP_APPROVALS:
      return { ...state, group_approvals: payload, isFetchingGroupApprovals: false, requestedGroupApprovals: true };
    case GET_WHOLESALE_APPROVALS:
      return { ...state, wholesale_approvals: payload, isFetchingWholesaleApprovals: false, requestedWholesaleApprovals: true };
    case UPDATE_DAILY_LOGINS:
      return { ...state, ...payload, requestedDailyLogins: true, isFetchingDailyLogins: false };
    case IS_FETCHING_DAILY_LOGINS:
      return { ...state, isFetchingDailyLogins: payload };
    case HAS_REQUESTED_DAILY_LOGINS:
      return { ...state, requestedDailyLogins: payload };
    case IS_FETCHING_BENEFITS_CONFIGS:
      return { ...state, isFetchingBenefitsConfigs: payload };
    case HAS_REQUESTED_BENEFITS_CONFIGS:
      return { ...state, requestedBenefitsConfigs: payload };
    case GET_CORE_SETTINGS:
      const has_updated_core_version = (payload.support_app_version === state.core_settings.support_app_version);
      const incoming_support_app_version = payload.support_app_version;
      const previous_support_app_version = state.core_settings.support_app_version;

      return {
        ...state,
        core_settings: {
          ...payload,
          support_app_version: has_updated_core_version ? payload.support_app_version : state.core_settings.support_app_version,
          incoming_support_app_version: payload.support_app_version
        },
        isFetchingCoreSettings: false,
        requestedCoreSettings: true,
        requires_refresh: !has_updated_core_version ? (incoming_support_app_version > previous_support_app_version) : state.requires_refresh
      };
    case GET_ALL_ACCOUNT_TRANSACTIONS:
      return { ...state, isFetchingAllTransactions: false, requestedAllTransactions: true, transactions: payload };
    case UPDATE_CORE_SETTINGS:
      return { ...state, core_settings: payload, isFetchingCoreSettings: false, requestedCoreSettings: true, requires_refresh: false };
    case UPDATE_ACCOUNT_RECORD:
      let existing_accounts = state.accounts.filter((e) => e.account_id !== payload.account_id);
      let updated_account = state.accounts.find((e) => e.account_id === payload.account_id);
      updated_account = {...updated_account, ...payload.updates};
      existing_accounts = [...existing_accounts, updated_account];
      return { ...state, accounts: existing_accounts };
    case UPDATE_PARTNER_ACCOUNT_RECORD:
      let existing_partner_accounts = state.partners.filter((e) => e.account_id !== payload.account_id);
      let updated_partner_account = state.partners.find((e) => e.account_id === payload.account_id);
      updated_partner_account = { ...updated_partner_account, ...payload.updates };
      existing_partner_accounts = [...existing_partner_accounts, updated_partner_account];
      return { ...state, partners: existing_partner_accounts };
    case GET_ALL_USERS:
      return { ...state, users: payload, isFetchingAllUsers: false, requestedAllUsers: true };
    case GET_ALL_CS_USERS:
      return { ...state, cs_users: payload, isFetchingCSUsers: false, requestedCSUsers: true };
    case GET_USER_RECORD:
      const fetched_users = state.users;
      let users_without_fetch = fetched_users.filter((u) => u.cognito_id !== payload.cognito_id);
      let this_user = fetched_users.find((u) => u.cognito_id === payload.cognito_id);
      return { ...state, users: [ { ...this_user, ...payload, fetched: true, last_fetch: new Date() }, ...users_without_fetch] };
    case ADD_USER_RECORD:
      return { ...state, users: [...state.users, payload] };
    case UPDATE_USER_RECORD:
      const existing_users = state.users;
      let users_without_payload = existing_users.filter((u) => u.cognito_id !== payload.cognito_id);
      let user = existing_users.find((u) => u.cognito_id === payload.cognito_id);
      return { ...state, users: [{ ...user, ...payload, fetched: false, last_fetch: new Date() }, ...users_without_payload], user_update_modal_open: false, user_defaults: {} };
    case OPEN_USER_UPDATE_MODAL:
      return { ...state, user_update_modal_open: true, user_defaults: payload.defaults, updating: payload.updating };
    case CLOSE_USER_UPDATE_MODAL:
      return { ...state, user_update_modal_open: false, user_defaults: {}, updating: false };
    case OPEN_ADD_MEMBERSHIP_MODAL:
      return { ...state, creating_new_membership: true, membership_type: payload.membership_type };
    case CLOSE_ADD_MEMBERSHIP_MODAL:
      return { ...state, creating_new_membership: false, membership_type: "client" };
    case GET_ALL_PARTNERS:
      return { ...state, partners: payload, isFetchingPartners: false, requestedPartners: true };
    case IS_FETCHING_ALL_ACCOUNTS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_ALL_ACCOUNTS:
      return { ...state, requested: payload };
    case IS_FETCHING_ALL_PARTNERS:
      return { ...state, isFetchingPartners: payload };
    case IS_FETCHING_ALL_TRANSACTIONS:
      return { ...state, isFetchingAllTransactions: payload };
    case IS_FETCHING_ALL_USERS:
      return { ...state, isFetchingAllUsers: payload };
    case IS_FETCHING_CS_USERS:
      return { ...state, isFetchingCSUsers: payload };
    case IS_FETCHING_CORE_SETTINGS:
      return { ...state, isFetchingCoreSettings: payload };
    case IS_FETCHING_PENDING_APPROVALS:
      return { ...state, isFetchingPendingApprovals: payload };
    case IS_FETCHING_GROUP_APPROVALS:
      return { ...state, isFetchingGroupApprovals: payload };
    case IS_FETCHING_WHOLESALE_APPROVALS:
      return { ...state, isFetchingWholesaleApprovals: payload };
    case HAS_REQUESTED_ALL_TRANSACTIONS:
      return { ...state, requestedAllTransactions: payload };
    case HAS_REQUESTED_PENDING_APPROVALS:
      return { ...state, requestedPendingApprovals: payload };
    case HAS_REQUESTED_GROUP_APPROVALS:
      return { ...state, requestedGroupApprovals: payload };
    case HAS_REQUESTED_WHOLESALE_APPROVALS:
      return { ...state, requestedWholesaleApprovals: payload };
    case HAS_REQUESTED_ALL_PARTNERS:
      return { ...state, requestedPartners: payload };
    case HAS_REQUESTED_ALL_USERS:
      return { ...state, requestedAllUsers: payload };
    case HAS_REQUESTED_ALL_CS_USERS:
      return { ...state, requestedCSUsers: payload };
    case HAS_REQUESTED_CORE_SETTINGS:
      return { ...state, requestedCoreSettings: payload };
    case CLEAR_CUSTOMER_SUPPORT:
      return { ...defaultState, core_settings: { ...defaultState.core_settings, support_app_version: state.core_settings.support_app_version } };
    case CHANGE_CUSTOMER_SUPPORT_BENEFITS_TAB:
      return { ...state, active_benefits_tab: payload };
    case CHANGE_CUSTOMER_SUPPORT_BENEFITS_APPROVAL_TAB:
      return { ...state, active_benefits_approval_tab: payload };
    case CHANGE_CUSTOMER_SUPPORT_SETTINGS_TAB:
      return { ...state, active_tab: payload };
    case CHANGE_CUSTOMER_SUPPORT_CORE_SETTINGS_TAB:
      return { ...state, active_core_settings_tab: payload };
    case CHANGE_CUSTOMER_SUPPORT_LEADS_TAB:
      return { ...state, active_lead_tab: payload };
    case CHANGE_CUSTOMER_SUPPORT_ACCOUNTS_TAB:
      return { ...state, active_accounts_tab: payload };
    case CHANGE_CUSTOMER_SUPPORT_PLANS_TAB:
      return { ...state, active_plan_tab: payload };
    case UPDATE_APP_VERSION:
      return { ...state, requires_refresh: false, core_settings: { ...state.core_settings, support_app_version: state.core_settings.incoming_support_app_version, incoming_support_app_version: 0.0 } };
    case LOCATION_CHANGE:
      return { ...state, user_update_modal_open: false, user_defaults: {}, current_page: 1 };
    case UPDATE_REFRESH_STATE:
      return { ...state, is_refreshing: payload };
    case CLEAR_ALL:
      return { ...defaultState, core_settings: { ...defaultState.core_settings, support_app_version: state.core_settings ? state.core_settings.support_app_version : 0 } };
    default:
      return state;
  }
};

export default customerSupportReducer;
