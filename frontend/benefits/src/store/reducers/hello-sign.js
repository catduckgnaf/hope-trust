import { UPDATE_DOWNLOAD_LINK, UPDATE_REQUEST_ID, UPDATE_SIGNATURE_REQUEST_ID, UPDATE_CONTRACT_STATE, CLEAR_ALL } from "../actions/constants";

const defaultState = { download_link: null, request_id: null, signature_request_id: null,  };
const helloSignReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_REQUEST_ID:
      return { ...state, request_id: payload };
    case UPDATE_SIGNATURE_REQUEST_ID:
      return { ...state, signature_request_id: payload };
    case UPDATE_DOWNLOAD_LINK:
      return { ...state, download_link: payload };
    case UPDATE_CONTRACT_STATE:
      return { ...state, ...payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default helloSignReducer;
