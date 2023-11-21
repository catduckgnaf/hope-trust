import {
  OPEN_PLAID_LINK_MODAL,
  CLOSE_PLAID_LINK_MODAL,
  GET_ACCOUNT_GRANTOR_ASSETS,
  GET_ACCOUNT_BENEFICIARY_ASSETS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  token: "",
  metadata: {},
  linking_assets: false
};

const plaidReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case OPEN_PLAID_LINK_MODAL:
      let open_plaid_config = {};
      open_plaid_config.linking_assets = true;
      open_plaid_config.token = payload.token;
      open_plaid_config.metadata = payload.metadata;
      return { ...state, ...open_plaid_config };
    case CLOSE_PLAID_LINK_MODAL:
      let close_plaid_config = {};
      close_plaid_config.linking_assets = false;
      close_plaid_config.token = "";
      close_plaid_config.metadata = {};
      return { ...state, ...close_plaid_config };
    case GET_ACCOUNT_GRANTOR_ASSETS:
      return defaultState;
    case GET_ACCOUNT_BENEFICIARY_ASSETS:
      return defaultState;
    case LOCATION_CHANGE:
      return state;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default plaidReducer;
