import {
  GET_TEAMS,
  OPEN_TEAM_MODAL,
  CLOSE_TEAM_MODAL,
  ADD_TEAM,
  DELETE_TEAM,
  EDIT_TEAM,
  IS_FETCHING_TEAMS,
  HAS_REQUESTED_TEAMS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_team: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const teamsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_TEAMS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_TEAM:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_TEAM:
      const old_teams_before_delete = state.list;
      const new_teams_after_delete = old_teams_before_delete.filter((team) => team.id !== payload);
      return { ...state, list: new_teams_after_delete };
    case EDIT_TEAM:
      const old_teams_before_edit = state.list;
      const new_teams_after_edit = old_teams_before_edit.filter((team) => team.id !== payload.id);
      return { ...state, list: [...new_teams_after_edit, payload] };
    case OPEN_TEAM_MODAL:
      return { ...state, current_page: payload.current_page, viewing_team: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_TEAM_MODAL:
      return { ...state, viewing_team: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_TEAMS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_TEAMS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_team: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default teamsReducer;