import {
  GET_ACCOUNTS,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = [];
const accountsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACCOUNTS:
      return [ ...payload ];
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default accountsReducer;