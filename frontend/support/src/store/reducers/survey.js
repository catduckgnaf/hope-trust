import {
  GET_SURVEYS,
  GET_SESSIONS,
  CREATE_SURVEY,
  UPDATE_SURVEY,
  DELETE_SURVEY,
  DELETE_SURVEYS,
  UPDATE_SESSION,
  DELETE_SESSION,
  DELETE_SESSIONS,
  IS_FETCHING_SURVEYS,
  IS_FETCHING_SESSIONS,
  HAS_REQUESTED_SURVEYS,
  HAS_REQUESTED_SESSIONS,
  CHANGE_SURVEY_TAB,
  OPEN_CREATE_SURVEY_MODAL,
  CLOSE_CREATE_SURVEY_MODAL,
  OPEN_CREATE_SESSION_MODAL,
  CLOSE_CREATE_SESSION_MODAL,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_survey: false,
  viewing_session: false,
  list: [],
  sessions: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  requestedSessions: false,
  isFetchingSessions: false,
  active_tab: "surveys"
};
const surveyReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_SURVEYS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case GET_SESSIONS:
      return { ...state, sessions: payload, requestedSessions: true, isFetchingSessions: false };
    case CREATE_SURVEY:
      return { ...state, list: [payload, ...state.list] };
    case UPDATE_SURVEY:
      const old_survey_list_before_edit = state.list;
      let new_survey_list_after_edit = old_survey_list_before_edit.filter((config) => config.id !== payload.id);
      new_survey_list_after_edit.splice((payload.sort_order - 1), 0, payload);
      return { ...state, list: new_survey_list_after_edit };
    case DELETE_SURVEY:
      const old_surveys_before_delete = state.list;
      const new_surveys_after_delete = old_surveys_before_delete.filter((config) => config.id !== payload);
      return { ...state, list: new_surveys_after_delete };
    case DELETE_SURVEYS:
      const old_bulk_surveys_before_delete = state.list;
      const new_bulk_surveys_after_delete = old_bulk_surveys_before_delete.filter((config) => !payload.includes(config.id));
      return { ...state, list: new_bulk_surveys_after_delete };
    case UPDATE_SESSION:
      const old_session_list_before_edit = state.sessions;
      const new_session_list_after_edit = old_session_list_before_edit.filter((config) => config.id !== payload.id);
      return { ...state, sessions: [...new_session_list_after_edit, payload] };
    case DELETE_SESSION:
      const old_sessions_before_delete = state.sessions;
      const new_sessions_after_delete = old_sessions_before_delete.filter((config) => config.id !== payload);
      return { ...state, sessions: new_sessions_after_delete };
    case DELETE_SESSIONS:
      const old_bulk_sessions_before_delete = state.sessions;
      const new_bulk_sessions_after_delete = old_bulk_sessions_before_delete.filter((config) => !payload.includes(config.id));
      return { ...state, sessions: new_bulk_sessions_after_delete };
    case OPEN_CREATE_SURVEY_MODAL:
      return { ...state, viewing_survey: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CREATE_SURVEY_MODAL:
      return { ...state, viewing_survey: false, defaults: {}, updating: false, viewing: false };
    case OPEN_CREATE_SESSION_MODAL:
      return { ...state, viewing_session: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CREATE_SESSION_MODAL:
      return { ...state, viewing_session: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_SURVEYS:
      return { ...state, isFetching: payload };
    case IS_FETCHING_SESSIONS:
      return { ...state, isFetchingSessions: payload };
    case HAS_REQUESTED_SURVEYS:
      return { ...state, requested: payload };
    case HAS_REQUESTED_SESSIONS:
      return { ...state, requestedSessions: payload };
    case CHANGE_SURVEY_TAB:
      return { ...state, active_tab: payload };
    case LOCATION_CHANGE:
      return { ...state, viewing_survey: false, viewing_session: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default surveyReducer;