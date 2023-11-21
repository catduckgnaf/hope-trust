import { IS_FETCHING_NOTIFICATION_SETTINGS, SET_NOTIFICATION_SETTINGS, CHANGE_SETTINGS_TAB, CLEAR_ALL } from "../actions/constants";

const defaultState = { notifications: {}, isFetching: false, requested: false, active_tab: "profile" };

const settingsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case SET_NOTIFICATION_SETTINGS:
      return { ...state, notifications: payload, isFetching: false, requested: true };
    case IS_FETCHING_NOTIFICATION_SETTINGS:
      return { ...state, isFetching: payload };
    case CHANGE_SETTINGS_TAB:
      return { ...state, active_tab: payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default settingsReducer;
