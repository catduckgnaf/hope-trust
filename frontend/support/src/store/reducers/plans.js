import { 
  CLEAR_ALL,
  GET_USER_PLANS,
  GET_PARTNER_PLANS,
  GET_ACTIVE_USER_PLANS,
  GET_ACTIVE_PARTNER_PLANS,
  IS_FETCHING_USER_PLANS,
  IS_FETCHING_PARTNER_PLANS,
  IS_FETCHING_ACTIVE_PARTNER_PLANS,
  IS_FETCHING_ACTIVE_USER_PLANS,
  HAS_REQUESTED_ACTIVE_USER_PLANS,
  HAS_REQUESTED_USER_PLANS,
  HAS_REQUESTED_PARTNER_PLANS,
  HAS_REQUESTED_ACTIVE_PARTNER_PLANS,
  CREATE_USER_PLAN,
  CREATE_PARTNER_PLAN,
  UPDATE_USER_PLAN,
  UPDATE_PARTNER_PLAN,
  DELETE_USER_PLAN,
  DELETE_PARTNER_PLAN,
  OPEN_CREATE_USER_PLAN_MODAL,
  OPEN_CREATE_PARTNER_PLAN_MODAL,
  CLOSE_CREATE_USER_PLAN_MODAL,
  CLOSE_CREATE_PARTNER_PLAN_MODAL,
  CHANGE_CUSTOMER_SUPPORT_PLANS_TAB,
  LOCATION_CHANGE
} from "../actions/constants";

const defaultState = {
  user_plans: [],
  current_page: 1,
  partner_plans: [],
  active_user_plans: [],
  active_partner_plans: [],
  isFetchingUserPlans: false,
  isFetchingPartnerPlans: false,
  isFetchingActivePartnerPlans: false,
  isFetchingActiveUserPlans: false,
  requestedActiveUserPlans: false,
  requestedActivePartnerPlans: false,
  requestedUserPlans: false,
  requestedPartnerPlans: false,
  viewing_user_plan: false,
  viewing_partner_plan: false,
  defaults: [],
  updating:false,
  viewing:false
};
const plansReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_USER_PLANS:
      return { ...state, isFetchingUserPlans: false, requestedUserPlans: true, user_plans: payload };
    case GET_ACTIVE_USER_PLANS:
      return { ...state, isFetchingActiveUserPlans: false, requestedActiveUserPlans: true, active_user_plans: payload };
    case CREATE_USER_PLAN:
      return { ...state, user_plans: [payload.data, ...state.user_plans] };
    case DELETE_USER_PLAN:
      const old_user_plans_before_delete = state.user_plans;
      const new_user_plans_after_delete = old_user_plans_before_delete.filter((plan) => plan.id !== payload);
      return { ...state, user_plans: new_user_plans_after_delete };
    case UPDATE_USER_PLAN:
      const old_user_plans_before_edit = state.user_plans;
      const new_user_plans_after_edit = old_user_plans_before_edit.filter((plan) => plan.id !== payload.ID);
      return { ...state, user_plans: [...new_user_plans_after_edit, payload.data] };
    case GET_PARTNER_PLANS:
      return { ...state, isFetchingPartnerPlans: false, requestedPartnerPlans: true, partner_plans: payload };
    case GET_ACTIVE_PARTNER_PLANS:
      return { ...state, isFetchingActivePartnerPlans: false, requestedActivePartnerPlans: true, active_partner_plans: payload };
    case CREATE_PARTNER_PLAN:
      return { ...state, partner_plans: [payload.data, ...state.partner_plans] };
    case DELETE_PARTNER_PLAN:
      const old_partner_plans_before_delete = state.partner_plans;
      const new_partner_plans_after_delete = old_partner_plans_before_delete.filter((plan) => plan.id !== payload);
      return { ...state, partner_plans: new_partner_plans_after_delete };
    case UPDATE_PARTNER_PLAN:
      const old_partner_plans_before_edit = state.partner_plans;
      const new_partner_plans_after_edit = old_partner_plans_before_edit.filter((plan) => plan.id !== payload.ID);
      return { ...state, partner_plans: [...new_partner_plans_after_edit, payload.data] };
    case IS_FETCHING_USER_PLANS:
      return { ...state, isFetchingUserPlans: payload };
    case IS_FETCHING_PARTNER_PLANS:
      return { ...state, isFetchingPartnerPlans: payload };
    case IS_FETCHING_ACTIVE_PARTNER_PLANS:
      return { ...state, isFetchingActivePartnerPlans: payload };
    case IS_FETCHING_ACTIVE_USER_PLANS:
      return { ...state, isFetchingActiveUserPlans: payload };
    case HAS_REQUESTED_USER_PLANS:
      return { ...state, requestedUserPlans: payload };
    case HAS_REQUESTED_ACTIVE_PARTNER_PLANS:
      return { ...state, requestedActivePartnerPlans: payload };
    case HAS_REQUESTED_ACTIVE_USER_PLANS:
      return { ...state, requestedActiveUserPlans: payload };
    case HAS_REQUESTED_PARTNER_PLANS:
      return { ...state, requestedPartnerPlans: payload };
    case OPEN_CREATE_USER_PLAN_MODAL:
      return { ...state, viewing_user_plan: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing, current_page: payload.current_page };
    case CLOSE_CREATE_USER_PLAN_MODAL:
      return { ...state, viewing_user_plan: false, defaults: {}, updating: false, viewing: false };
    case OPEN_CREATE_PARTNER_PLAN_MODAL:
      return { ...state, viewing_partner_plan: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing, current_page: payload.current_page };
    case CLOSE_CREATE_PARTNER_PLAN_MODAL:
      return { ...state, viewing_partner_plan: false, defaults: {}, updating: false, viewing: false };
    case CHANGE_CUSTOMER_SUPPORT_PLANS_TAB:
      return { ...state, viewing_partner_plan: false, viewing_user_plan: false, defaults: {}, current_page: 1 };
    case LOCATION_CHANGE:
      return { ...state, viewing_partner_plan: false, defaults: {}, current_page: 1 };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default plansReducer;
