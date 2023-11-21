import {
  GET_PRODUCTS,
  IS_FETCHING_PRODUCTS,
  HAS_REQUESTED_PRODUCTS,
  OPEN_CREATE_PRODUCT_MODAL,
  CLOSE_CREATE_PRODUCT_MODAL,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  list: [],
  current_page: 1,
  isFetchingProducts: false,
  requestedProducts: false,
  show_product_modal: false,
};
const productReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_PRODUCTS:
      return { ...state, isFetchingProducts: false, requestedProducts: true, list: payload };
    case CREATE_PRODUCT:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_PRODUCT:
      const old_list_before_delete = state.list;
      const new_list_after_delete = old_list_before_delete.filter((product) => product.id !== payload);
      return { ...state, list: new_list_after_delete };
    case UPDATE_PRODUCT:
      const old_list_before_edit = state.list;
      const new_list_after_edit = old_list_before_edit.filter((product) => product.id !== payload.ID);
      return { ...state, list: [...new_list_after_edit, payload.data] };
    case OPEN_CREATE_PRODUCT_MODAL:
      return { ...state, show_product_modal: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing, current_page: payload.current_page };
    case CLOSE_CREATE_PRODUCT_MODAL:
      return { ...state, show_product_modal: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_PRODUCTS:
      return { ...state, isFetchingProducts: payload };
    case HAS_REQUESTED_PRODUCTS:
      return { ...state, requestedProducts: payload };
    case LOCATION_CHANGE:
      return { ...state, show_product_modal: false, defaults: {}, current_page: 1 };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default productReducer;
