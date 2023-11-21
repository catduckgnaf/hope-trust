import {
  GET_PRODUCTS,
  IS_FETCHING_PRODUCTS,
  HAS_REQUESTED_PRODUCTS,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";

const defaultState = {
  list: [],
  isFetchingProducts: false,
  requestedProducts: false,
  show_product_modal: false,
};
const productReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_PRODUCTS:
      return { ...state, isFetchingProducts: false, requestedProducts: true, list: payload };
    case IS_FETCHING_PRODUCTS:
      return { ...state, isFetchingProducts: payload };
    case HAS_REQUESTED_PRODUCTS:
      return { ...state, requestedProducts: payload };
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetchingProducts: false };
    default:
      return state;
  }
};

export default productReducer;
