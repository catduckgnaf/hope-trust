import {
  IS_FETCHING_CORE_SETTINGS,
  HAS_REQUESTED_CORE_SETTINGS,
  GET_CORE_SETTINGS,
  UPDATE_APP_VERSION,
  CLEAR_CUSTOMER_SUPPORT,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  isFetchingCoreSettings: false,
  requestedCoreSettings: false,
  has_updated_core_version: false,
  core_settings: {
    benefits_app_version: 0,
    incoming_benefits_app_version: 0
  },
  requires_refresh: false
};
const customerSupportReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_CORE_SETTINGS:
      const has_updated_core_version = (payload.benefits_app_version === state.core_settings.benefits_app_version);
      const incoming_benefits_app_version = payload.benefits_app_version;
      const previous_benefits_app_version = state.core_settings.benefits_app_version;

      return {
        ...state,
        core_settings: {
          ...payload,
          benefits_app_version: has_updated_core_version ? payload.benefits_app_version : state.core_settings.benefits_app_version,
          incoming_benefits_app_version: payload.benefits_app_version
        },
        isFetchingCoreSettings: false,
        requestedCoreSettings: true,
        requires_refresh: !has_updated_core_version ? (incoming_benefits_app_version > previous_benefits_app_version) : state.requires_refresh
      };
    case IS_FETCHING_CORE_SETTINGS:
      return { ...state, isFetchingCoreSettings: payload };
    case HAS_REQUESTED_CORE_SETTINGS:
      return { ...state, requestedCoreSettings: payload };
    case UPDATE_APP_VERSION:
      return { ...state, requires_refresh: false, core_settings: { ...state.core_settings, benefits_app_version: state.core_settings.incoming_benefits_app_version, incoming_benefits_app_version: 0.0 } };
    case CLEAR_CUSTOMER_SUPPORT:
      return { ...defaultState, core_settings: { ...defaultState.core_settings, benefits_app_version: state.core_settings.benefits_app_version } };
    case CLEAR_ALL:
      return { ...defaultState, core_settings: { ...defaultState.core_settings, benefits_app_version: state.core_settings ? state.core_settings.benefits_app_version : 0 } };
    default:
      return state;
  }
};

export default customerSupportReducer;
