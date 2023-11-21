import { LOCATION_CHANGE, HAS_REQUESTED_REFERRALS, IS_FETCHING_REFERRALS, GET_REFERRALS, UPDATE_REFERRAL, CREATE_REFERRAL, DELETE_REFERRAL, DELETE_REFERRALS, OPEN_CREATE_REFERRAL_MODAL, CLOSE_CREATE_REFERRAL_MODAL, CLEAR_ALL } from "../actions/constants";

const defaultState = { current_page: 1, creating_referral: false, list: [], defaults: {}, updating: false, viewing: false, requested: false, isFetching: false };
const providerReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_REFERRALS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case CREATE_REFERRAL:
      return { ...state, list: [payload, ...state.list] };
    case UPDATE_REFERRAL:
      const updatable = state.list.filter((p) => p.id !== payload.id);
      return { ...state, list: [payload, ...updatable] };
    case DELETE_REFERRAL:
      const preserved_providers = state.list.filter((p) => p.id !== payload);
      return { ...state, list: preserved_providers };
    case DELETE_REFERRALS:
      const old_bulk_referrals_before_delete = state.list;
      const new_bulk_referrals_after_delete = old_bulk_referrals_before_delete.filter((referral) => !payload.includes(referral.id));
      return { ...state, list: new_bulk_referrals_after_delete };
    case OPEN_CREATE_REFERRAL_MODAL:
      return { ...state, creating_referral: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing, current_page: payload.current_page };
    case CLOSE_CREATE_REFERRAL_MODAL:
      return { ...state, creating_referral: false, defaults: {}, updating: false, viewing: false };
    case HAS_REQUESTED_REFERRALS:
      return {...state, requested: payload };
    case IS_FETCHING_REFERRALS:
      return {...state, isFetching: payload };
    case LOCATION_CHANGE:
      return { ...state, creating_referral: false, defaults: {}, current_page: 1 };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default providerReducer;
