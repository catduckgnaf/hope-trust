import {
  GET_AGENTS,
  OPEN_AGENT_MODAL,
  CLOSE_AGENT_MODAL,
  ADD_AGENT,
  DELETE_AGENT,
  EDIT_AGENT,
  IS_FETCHING_AGENTS,
  HAS_REQUESTED_AGENTS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_agent: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const agentsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_AGENTS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_AGENT:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_AGENT:
      const old_agents_before_delete = state.list;
      const new_agents_after_delete = old_agents_before_delete.filter((agent) => agent.id !== payload);
      return { ...state, list: new_agents_after_delete };
    case EDIT_AGENT:
      const old_agents_before_edit = state.list;
      const new_agents_after_edit = old_agents_before_edit.filter((agent) => agent.id !== payload.id);
      return { ...state, list: [...new_agents_after_edit, payload] };
    case OPEN_AGENT_MODAL:
      return { ...state, current_page: payload.current_page, viewing_agent: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_AGENT_MODAL:
      return { ...state, viewing_agent: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_AGENTS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_AGENTS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_agent: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default agentsReducer;