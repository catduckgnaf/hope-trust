import {
  GET_RETAILERS,
  OPEN_RETAIL_MODAL,
  CLOSE_RETAIL_MODAL,
  ADD_RETAILER,
  DELETE_RETAILER,
  EDIT_RETAILER,
  IS_FETCHING_RETAILERS,
  HAS_REQUESTED_RETAILERS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_retailer: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const retailerReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_RETAILERS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_RETAILER:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_RETAILER:
      const old_retailers_before_delete = state.list;
      const new_retailers_after_delete = old_retailers_before_delete.filter((retailer) => retailer.id !== payload);
      return { ...state, list: new_retailers_after_delete };
    case EDIT_RETAILER:
      const old_retailers_before_edit = state.list;
      const new_retailers_after_edit = old_retailers_before_edit.filter((retailer) => retailer.id !== payload.id);
      return { ...state, list: [...new_retailers_after_edit, payload] };
    case OPEN_RETAIL_MODAL:
      return { ...state, current_page: payload.current_page, viewing_retailer: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_RETAIL_MODAL:
      return { ...state, viewing_retailer: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_RETAILERS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_RETAILERS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_retailer: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default retailerReducer;