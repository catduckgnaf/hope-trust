import { SHOW_LOADER, HIDE_LOADER, LOCATION_CHANGE, IS_LOGGED_OUT } from "../actions/constants";

const defaultState = { show: false, message: "Loading..." };
const loaderReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case SHOW_LOADER:
      return { show: payload.show, message: payload.message };
    case HIDE_LOADER:
      return defaultState;
    case LOCATION_CHANGE:
      return defaultState;
    case IS_LOGGED_OUT:
      return defaultState;
    default:
      return state;
  }
};

export default loaderReducer;
