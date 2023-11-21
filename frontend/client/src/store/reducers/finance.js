import {
  SET_ACTIVE_FINANCE_TAB,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  active_finance_tab: "assets",
};

const financeReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case SET_ACTIVE_FINANCE_TAB:
      return { ...state, active_finance_tab: payload };
    case LOCATION_CHANGE:
      return state;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default financeReducer;
