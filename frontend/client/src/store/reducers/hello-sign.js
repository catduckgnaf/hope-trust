import { UPDATE_CONTRACT_STATE, UPDATE_DOWNLOAD_LINK, UPDATE_REQUEST_ID, LOCATION_CHANGE, CLEAR_ALL } from "../actions/constants";

const defaultState = { download_link: null, request_id: null, contract_open: false };
const helloSignReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_REQUEST_ID:
      return { ...state, request_id: payload };
    case UPDATE_DOWNLOAD_LINK:
      return { ...state, download_link: payload };
    case UPDATE_CONTRACT_STATE:
      return { ...state, ...payload };
    case LOCATION_CHANGE:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default helloSignReducer;
