import { TOGGLE_MOBILE_NAVIGATION_MENU, LOCATION_CHANGE, CLEAR_ALL } from "../actions/constants";

const defaultState = { show: false, mini_menu: false };
const navigationReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE:
      return { ...state, show: false };
    case TOGGLE_MOBILE_NAVIGATION_MENU:
      return { ...state, show: !state.show };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default navigationReducer;
