import { findIndex } from "lodash";
import { UPDATE_SURVEY_STATUS, HAS_REQUESTED_SURVEYS, IS_FETCHING_SURVEYS, IS_FETCHING_SURVEY, GET_SURVEYS, UPDATE_SURVEY_LOADING_STATE, GET_SURVEY, SET_SURVEY, RETRY_SURVEY, RESET_RETRYS, CLOSE_SURVEY, CLEAR_ALL, LOCATION_CHANGE } from "../actions/constants";

const defaultState = {
  list: [],
  focus: false,
  requested: false,
  isFetching: false,
  isFetchingSurvey: false,
  loading: "",
  retrys: 0,
  max_retrys: 2,
  is_retrying: false,
  status: {}
};
const hopeCarePlanReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_SURVEYS:
      return { ...state, list: payload, isFetching: false, requested: true };
    case GET_SURVEY:
      let newSurveys = state.list;
      const survey_index = findIndex(state.list, (s) => s.survey_id === payload.survey_id);
      newSurveys.splice(survey_index, 1, payload);
      return { ...state, list: newSurveys, retrys: 0, is_retrying: false, loading: "" };
    case SET_SURVEY:
        return { ...state, focus: payload };
    case CLOSE_SURVEY:
        return { ...state, focus: false };
    case IS_FETCHING_SURVEYS:
        return { ...state, isFetching: payload };
    case IS_FETCHING_SURVEY:
      return { ...state, isFetchingSurvey: payload };
    case HAS_REQUESTED_SURVEYS:
      return { ...state, requested: payload };
    case UPDATE_SURVEY_LOADING_STATE:
      return { ...state, loading: payload };
    case UPDATE_SURVEY_STATUS:
      return { ...state, status: payload };
    case RETRY_SURVEY:
      return { ...state, retrys: state.retrys + 1, is_retrying: true };
    case RESET_RETRYS:
      return { ...state, retrys: 0, loading: "", is_retrying: false };
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetching: false, isFetchingSurvey: false };
    default:
      return state;
  }
};

export default hopeCarePlanReducer;
