import { UPDATE_DOWNLOAD_LINK, LOCATION_CHANGE, CLEAR_ALL } from "../actions/constants";

const defaultState = { download_link: null };
const helloSignReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_DOWNLOAD_LINK:
      return { ...state, download_link: payload };
    case LOCATION_CHANGE:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default helloSignReducer;
