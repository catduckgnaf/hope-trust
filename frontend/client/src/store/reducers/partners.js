import {
  UPDATE_PARTNER_CONVERSION_STATE,
  CLEAR_PARTNER_CONVERSION_STATE,
  OPEN_CONVERT_TO_PARTNER_MODAL,
  CLOSE_CONVERT_TO_PARTNER_MODAL,
  OPEN_PARTNER_PLAN_OVERLAY,
  CLOSE_PARTNER_PLAN_OVERLAY,
  GET_ORGANIZATION_PARTNERS,
  IS_FETCHING_ORGANIZATION_PARTNERS,
  HAS_FETCHED_ORGANIZATION_PARTNERS,
  OPEN_PARTNER_LOGO_MODAL,
  CLOSE_PARTNER_LOGO_MODAL,
  LOCATION_CHANGE,
  OPEN_CERTIFICATE_MODAL,
  CLOSE_CERTIFICATE_MODAL,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  state: {},
  currentStep: 0,
  convert_to_partner_show: false,
  is_choosing_plan: false,
  isFetchingOrgPartners: false,
  requestedOrgPartners: false,
  organization_partners: [],
  is_uploading_logo: false,
  is_updating_plan: false,
  is_viewing_certificate: false,
  certificate_config: {}
};
const partnersReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ORGANIZATION_PARTNERS:
      return { ...state, organization_partners: payload, requestedOrgPartners: true, isFetchingOrgPartners: false };
    case UPDATE_PARTNER_CONVERSION_STATE:
      return { ...state, ...payload };
    case CLEAR_PARTNER_CONVERSION_STATE:
      return defaultState;
    case OPEN_CONVERT_TO_PARTNER_MODAL:
      return { ...state, convert_to_partner_show: true };
    case CLOSE_CONVERT_TO_PARTNER_MODAL:
      return defaultState;
    case OPEN_PARTNER_PLAN_OVERLAY:
      return { ...state, is_choosing_plan: true };
    case CLOSE_PARTNER_PLAN_OVERLAY:
      return { ...state, is_choosing_plan: false };
    case OPEN_PARTNER_LOGO_MODAL:
      return { ...state, is_uploading_logo: true };
    case CLOSE_PARTNER_LOGO_MODAL:
      return { ...state, is_uploading_logo: false };
    case OPEN_CERTIFICATE_MODAL:
      return { ...state, is_viewing_certificate: true, certificate_config: payload };
    case CLOSE_CERTIFICATE_MODAL:
      return { ...state, is_viewing_certificate: false, certificate_config: {} };
    case IS_FETCHING_ORGANIZATION_PARTNERS:
      return { ...state, isFetchingOrgPartners: payload };
    case HAS_FETCHED_ORGANIZATION_PARTNERS:
      return { ...state, requestedOrgPartners: payload };
    case LOCATION_CHANGE:
      return { ...state, is_updating_plan: false, isFetchingOrgPartners: false };
    case "CLOSE_CERTIFICATE_MODAL":
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default partnersReducer;
