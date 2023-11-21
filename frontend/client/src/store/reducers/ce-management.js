import {
  GET_CE_CONFIGS,
  GET_CE_COURSES,
  IS_FETCHING_CE_CONFIGS,
  IS_FETCHING_CE_COURSES,
  HAS_REQUESTED_CE_CONFIGS,
  HAS_REQUESTED_CE_COURSES,
  CLOSE_STUDENT_ATTESTATION,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";

const defaultState = {
  list: [],
  courses: [],
  requested: false,
  isFetching: false,
  isFetchingCourses: false,
  requestedCourses: false
};
const ce_configsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_CE_CONFIGS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case GET_CE_COURSES:
      return { ...state, courses: payload, requestedCourses: true, isFetchingCourses: false };
    case IS_FETCHING_CE_CONFIGS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_CE_CONFIGS:
      return { ...state, requested: payload };
    case IS_FETCHING_CE_COURSES:
      return { ...state, isFetchingCourses: payload };
    case HAS_REQUESTED_CE_COURSES:
      return { ...state, requestedCourses: payload };
    case CLOSE_STUDENT_ATTESTATION:
      return { ...state, requested: false };
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetching: false, isFetchingCourses: false };
    default:
      return state;
  }
};

export default ce_configsReducer;