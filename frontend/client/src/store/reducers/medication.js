import {
  GET_MEDICATIONS,
  OPEN_MEDICATIONS_MODAL,
  CLOSE_MEDICATIONS_MODAL,
  ADD_MEDICATION,
  DELETE_MEDICATION,
  EDIT_MEDICATION,
  IS_FETCHING_MEDICATIONS,
  HAS_REQUESTED_MEDICATIONS,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  viewing_medication: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false,
  current_page: 1
};
const medicationReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_MEDICATIONS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_MEDICATION:
      return { ...state, list: [payload, ...state.list] };
    case DELETE_MEDICATION:
      const old_medications_before_delete = state.list;
      const new_medications_after_delete = old_medications_before_delete.filter((medication) => medication.id !== payload);
      return { ...state, list: new_medications_after_delete };
    case EDIT_MEDICATION:
      const old_medications_before_edit = state.list;
      const new_medications_after_edit = old_medications_before_edit.filter((medication) => medication.id !== payload.id);
      return { ...state, list: [...new_medications_after_edit, payload] };
    case OPEN_MEDICATIONS_MODAL:
      return { ...state, current_page: payload.current_page, viewing_medication: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_MEDICATIONS_MODAL:
      return { ...state, viewing_medication: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_MEDICATIONS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_MEDICATIONS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, current_page: 1, viewing_medication: false, defaults: {}, updating: false, viewing: false, isFetching: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default medicationReducer;