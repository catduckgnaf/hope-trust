import { 
  CLEAR_ALL,
  GET_ACTIVE_USER_PLANS,
  IS_FETCHING_ACTIVE_USER_PLANS,
  HAS_REQUESTED_ACTIVE_USER_PLANS
} from "../actions/constants";

const defaultState = {
  active_user_plans: [],
  isFetchingActiveUserPlans: false,
  requestedActiveUserPlans: false
};
const plansReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACTIVE_USER_PLANS:
      return { ...state, isFetchingActiveUserPlans: false, requestedActiveUserPlans: true, active_user_plans: payload };
    case IS_FETCHING_ACTIVE_USER_PLANS:
      return { ...state, isFetchingActiveUserPlans: payload };
    case HAS_REQUESTED_ACTIVE_USER_PLANS:
      return { ...state, requestedActiveUserPlans: payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default plansReducer;
