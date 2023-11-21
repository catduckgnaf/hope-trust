import { 
  CLEAR_ALL,
  GET_ACTIVE_USER_PLANS,
  GET_ACTIVE_PARTNER_PLANS,
  IS_FETCHING_ACTIVE_PARTNER_PLANS,
  IS_FETCHING_ACTIVE_USER_PLANS,
  HAS_REQUESTED_ACTIVE_USER_PLANS,
  HAS_REQUESTED_ACTIVE_PARTNER_PLANS,
  LOCATION_CHANGE,
} from "../actions/constants";

const defaultState = {
  active_user_plans: [],
  active_partner_plans: [],
  isFetchingActivePartnerPlans: false,
  isFetchingActiveUserPlans: false,
  requestedActiveUserPlans: false,
  requestedActivePartnerPlans: false
};
const plansReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACTIVE_USER_PLANS:
      return { ...state, isFetchingActiveUserPlans: false, requestedActiveUserPlans: true, active_user_plans: payload };
    case GET_ACTIVE_PARTNER_PLANS:
      return { ...state, isFetchingActivePartnerPlans: false, requestedActivePartnerPlans: true, active_partner_plans: payload };
    case IS_FETCHING_ACTIVE_PARTNER_PLANS:
      return { ...state, isFetchingActivePartnerPlans: payload };
    case IS_FETCHING_ACTIVE_USER_PLANS:
      return { ...state, isFetchingActiveUserPlans: payload };
    case HAS_REQUESTED_ACTIVE_PARTNER_PLANS:
      return { ...state, requestedActivePartnerPlans: payload };
    case HAS_REQUESTED_ACTIVE_USER_PLANS:
      return { ...state, requestedActiveUserPlans: payload };
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetchingActivePartnerPlans: false, isFetchingActiveUserPlans: false };
    default:
      return state;
  }
};

export default plansReducer;
