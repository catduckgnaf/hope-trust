import {
  CLEAR_CUSTOMER_SUPPORT,
  IS_FETCHING_CORE_SETTINGS,
  HAS_REQUESTED_CORE_SETTINGS,
  GET_CORE_SETTINGS,
  UPDATE_APP_VERSION,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";

const defaultState = {
  accounts: [],
  partners: [],
  transactions: {
    charge: [],
    subscription: [],
    refund: [],
    "add seat": []
  },
  isFetching: false,
  requested: false,
  active_tab: "referral-config",
  isFetchingCoreSettings: false,
  requestedCoreSettings: false,
  core_settings: {
    client_app_version: 0,
    incoming_client_app_version: 0,
    document_types: [],
    asset_types: [],
    income_types: [],
    budget_categories: [],
    benefit_types: [],
    contact_types: []
  },
  requires_refresh: false
};
const customerSupportReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_CORE_SETTINGS:
      const has_updated_core_version = (payload.client_app_version === state.core_settings.client_app_version);
      const incoming_client_app_version = payload.client_app_version;

      return {
        ...state,
        core_settings: {
          ...payload,
          client_app_version: has_updated_core_version ? payload.client_app_version : state.core_settings.client_app_version,
          incoming_client_app_version
        },
        isFetchingCoreSettings: false,
        requestedCoreSettings: true
      };
    case "NEW_VERSION":
      return { ...state, requires_refresh: true };
    case IS_FETCHING_CORE_SETTINGS:
      return { ...state, isFetchingCoreSettings: payload };
    case HAS_REQUESTED_CORE_SETTINGS:
      return { ...state, requestedCoreSettings: payload };
    case UPDATE_APP_VERSION:
      return { ...state, requires_refresh: false, core_settings: { ...state.core_settings, client_app_version: (state.core_settings.incoming_client_app_version || state.client_app_version), incoming_client_app_version: 0.0 } };
    case CLEAR_CUSTOMER_SUPPORT:
      return { ...defaultState, core_settings: { ...defaultState.core_settings, client_app_version: state.core_settings.client_app_version } };
    case CLEAR_ALL:
      return { ...defaultState, core_settings: { ...defaultState.core_settings, client_app_version: state.core_settings ? state.core_settings.client_app_version : 0 } };
    case LOCATION_CHANGE:
      return { ...state, isFetching: false, isFetchingCoreSettings: false };
    default:
      return state;
  }
};

export default customerSupportReducer;
