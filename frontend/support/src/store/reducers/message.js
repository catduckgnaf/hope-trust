import {
  CLEAR_ALL,
  SEND_MESSAGE,
  GET_MESSAGES,
  NEW_MESSAGE,
  DELETE_MESSAGE,
  DELETE_MESSAGES,
  UPDATE_MESSAGE,
  OPEN_MESSAGE,
  CLOSE_MESSAGE,
  IS_FETCHING_MESSAGES,
  HAS_REQUESTED_MESSAGES
} from "../actions/constants";

const defaultState = {
  list: [],
  show: false,
  requested: false,
  isFetching: false,
  updating: false,
  viewing: false,
  defaults: {
    to_cognito: "",
    from_email: "",
    to_email: "",
    to_first: "",
    to_last: "",
    subject: "",
    body: ""
  }
};
const messageReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_MESSAGES:
      return { ...state, list: payload, requested: true, isFetching: false };
    case IS_FETCHING_MESSAGES:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_MESSAGES:
      return { ...state, requested: payload };
    case SEND_MESSAGE:
      return { ...state, list: [ payload, ...state.list ]};
    case DELETE_MESSAGE:
      const old_messages_before_delete = state.list;
      const new_messages_after_delete = old_messages_before_delete.filter((message) => message.id !== payload);
      return { ...state, list: new_messages_after_delete };
    case DELETE_MESSAGES:
      const old_bulk_messages_before_delete = state.list;
      const new_bulk_messages_after_delete = old_bulk_messages_before_delete.filter((message) => !payload.includes(message.id));
      return { ...state, list: new_bulk_messages_after_delete };
    case UPDATE_MESSAGE:
      const updatable = state.list.filter((p) => p.id !== payload.id);
      return { ...state, list: [payload, ...updatable] };
    case NEW_MESSAGE:
      return { ...state, show: true, defaults: payload };
    case OPEN_MESSAGE:
      return { ...state, show: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_MESSAGE:
      return { ...state, show: false, defaults: defaultState.defaults };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default messageReducer;
