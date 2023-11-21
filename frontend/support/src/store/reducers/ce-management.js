import {
  GET_CE_CONFIGS,
  GET_CE_CREDITS,
  OPEN_CE_CONFIG_MODAL,
  CLOSE_CE_CONFIG_MODAL,
  ADD_CE_CONFIG,
  DELETE_CE_CONFIG,
  EDIT_CE_CONFIG,
  IS_FETCHING_CE_CONFIGS,
  HAS_REQUESTED_CE_CONFIGS,
  IS_FETCHING_CE_CREDITS,
  HAS_REQUESTED_CE_CREDITS,
  LOCATION_CHANGE,
  CHANGE_CE_TAB,
  IS_FETCHING_CE_COURSES,
  GET_CE_COURSES,
  HAS_REQUESTED_CE_COURSES,
  ADD_CE_COURSE,
  DELETE_CE_COURSE,
  OPEN_CE_COURSE_MODAL,
  CLOSE_CE_COURSE_MODAL,
  DELETE_CE_CONFIGS,
  DELETE_CE_COURSES,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_ce_config: false,
  viewing_ce_course: false,
  list: [],
  credits_list: [],
  courses: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  requestedCredits: false,
  isFetchingCredits: false,
  isFetchingCourses: false,
  requestedCourses: false,
  active_tab: "ce-states"
};
const ce_configsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_CE_CONFIGS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case GET_CE_CREDITS:
      return { ...state, credits_list: payload, requestedCredits: true, isFetchingCredits: false };
    case GET_CE_COURSES:
      return { ...state, courses: payload, requestedCourses: true, isFetchingCourses: false };
    case ADD_CE_CONFIG:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_CE_CONFIG:
      const old_ce_configs_before_delete = state.list;
      const new_ce_configs_after_delete = old_ce_configs_before_delete.filter((config) => config.id !== payload);
      return { ...state, list: new_ce_configs_after_delete };
    case DELETE_CE_CONFIGS:
      const old_bulk_configs_before_delete = state.list;
      const new_bulk_configs_after_delete = old_bulk_configs_before_delete.filter((config) => !payload.includes(config.id));
      return { ...state, list: new_bulk_configs_after_delete };
    case ADD_CE_COURSE:
      return { ...state, courses: [payload, ...state.courses] };
    case DELETE_CE_COURSE:
      const old_ce_courses_before_delete = state.courses;
      const new_ce_courses_after_delete = old_ce_courses_before_delete.filter((course) => course.id !== payload);
      return { ...state, courses: new_ce_courses_after_delete };
    case DELETE_CE_COURSES:
      const old_bulk_courses_before_delete = state.courses;
      const new_bulk_courses_after_delete = old_bulk_courses_before_delete.filter((course) => !payload.includes(course.id));
      return { ...state, courses: new_bulk_courses_after_delete };
    case EDIT_CE_CONFIG:
      const old_ce_configs_before_edit = state.list;
      const new_ce_configs_after_edit = old_ce_configs_before_edit.filter((config) => config.id !== payload.id);
      return { ...state, list: [...new_ce_configs_after_edit, payload] };
    case OPEN_CE_CONFIG_MODAL:
      return { ...state, viewing_ce_config: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CE_CONFIG_MODAL:
      return { ...state, viewing_ce_config: false, defaults: {}, updating: false, viewing: false };
    case OPEN_CE_COURSE_MODAL:
      return { ...state, viewing_ce_course: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CE_COURSE_MODAL:
      return { ...state, viewing_ce_course: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_CE_CONFIGS:
      return { ...state, isFetching: payload };
    case IS_FETCHING_CE_COURSES:
      return { ...state, isFetchingCourses: payload };
    case HAS_REQUESTED_CE_CONFIGS:
      return { ...state, requested: payload };
    case IS_FETCHING_CE_CREDITS:
      return { ...state, isFetchingCredits: payload };
    case HAS_REQUESTED_CE_CREDITS:
      return { ...state, requestedCredits: payload };
    case HAS_REQUESTED_CE_COURSES:
      return { ...state, requestedCourses: payload };
    case CHANGE_CE_TAB:
      return { ...state, active_tab: payload, current_page: 1 };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_ce_config: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default ce_configsReducer;