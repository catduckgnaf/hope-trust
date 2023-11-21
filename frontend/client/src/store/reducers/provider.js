import { LOCATION_CHANGE, HAS_REQUESTED_PROVIDERS, IS_FETCHING_PROVIDERS, GET_PROVIDERS, UPDATE_PROVIDERS, DELETE_PROVIDER, OPEN_CREATE_PROVIDER_MODAL, CLOSE_CREATE_PROVIDER_MODAL, CLEAR_ALL } from "../actions/constants";

const defaultState = { current_page: 1, creatingProvider: false, list: [], defaults: {}, updating: false, viewing: false, requested: false, isFetching: false };
const providerReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_PROVIDERS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case UPDATE_PROVIDERS:
      const updatable = state.list.filter((p) => p.id !== payload.id);
      return { ...state, list: [payload, ...updatable] };
    case DELETE_PROVIDER:
      const preserved_providers = state.list.filter((p) => p.id !== payload);
      return { ...state, list: preserved_providers };
    case OPEN_CREATE_PROVIDER_MODAL:
      return { ...state, current_page: payload.current_page, creatingProvider: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CREATE_PROVIDER_MODAL:
      return { ...state, creatingProvider: false, defaults: {}, updating: false, viewing: false };
    case HAS_REQUESTED_PROVIDERS:
      return {...state, requested: payload };
    case IS_FETCHING_PROVIDERS:
      return {...state, isFetching: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, isFetching: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default providerReducer;
