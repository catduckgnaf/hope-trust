import { SHOW_TOUR, HIDE_TOUR, CLEAR_ALL } from "../actions/constants";

const defaultState = { show: false };
const tourReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case SHOW_TOUR:
      return { show: true };
    case HIDE_TOUR:
      return { show: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default tourReducer;
