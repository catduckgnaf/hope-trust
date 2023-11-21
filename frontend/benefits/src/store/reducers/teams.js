import {
  GET_TEAMS,
  OPEN_TEAM_MODAL,
  CLOSE_TEAM_MODAL,
  IS_FETCHING_TEAMS,
  HAS_REQUESTED_TEAMS,
  LOCATION_CHANGE,
  CLEAR_CLIENT_REGISTRATION,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_team: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false
};
const teamsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_TEAMS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case OPEN_TEAM_MODAL:
      return { ...state, viewing_team: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_TEAM_MODAL:
      return { ...state, viewing_team: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_TEAMS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_TEAMS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, viewing_team: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_CLIENT_REGISTRATION:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default teamsReducer;