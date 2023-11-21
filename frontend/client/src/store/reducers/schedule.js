import {
  GET_SCHEDULE_EVENTS,
  OPEN_SCHEDULE_MODAL,
  CLOSE_SCHEDULE_MODAL,
  OPEN_VIEW_SCHEDULE_MODAL,
  CLOSE_VIEW_SCHEDULE_MODAL,
  ADD_EVENT,
  ADD_EVENTS,
  DELETE_EVENT,
  DELETE_EVENTS,
  EDIT_EVENT,
  EDIT_EVENTS,
  IS_FETCHING_EVENTS,
  HAS_REQUESTED_EVENTS,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";

const defaultState = {
  viewing_event: false,
  viewing_schedule: false,
  list: [],
  defaults: {},
  updating: false,
  viewing: false,
  requested: false,
  isFetching: false
};
const scheduleReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_SCHEDULE_EVENTS:
      return { ...state, list: payload, requested: true, isFetching: false };
    case ADD_EVENT:
      return { ...state, list: [payload, ...state.list] };
    case ADD_EVENTS:
      return { ...state, list: [...state.list, ...payload] };
    case DELETE_EVENT:
      const old_events_before_delete = state.list;
      const new_events_after_delete = old_events_before_delete.filter((event) => event.id !== payload);
      return { ...state, list: new_events_after_delete };
    case DELETE_EVENTS:
      let old_events_before_bulk_delete = state.list;
      const old_events_after_bulk_delete = old_events_before_bulk_delete.filter((d) => d.series_id !== payload);
      return { ...state, list: old_events_after_bulk_delete };
    case EDIT_EVENT:
      const old_events_before_edit = state.list;
      const new_events_after_edit = old_events_before_edit.filter((event) => event.id !== payload.id);
      return { ...state, list: [ ...new_events_after_edit, payload] };
    case EDIT_EVENTS:
      let old_events_before_bulk_edit = state.list;
      payload.forEach((updated_event) => {
        old_events_before_bulk_edit = old_events_before_bulk_edit.filter((old_event) => old_event.id !== updated_event.id);
      });
      return { ...state, list: [...old_events_before_bulk_edit, ...payload] };
    case OPEN_SCHEDULE_MODAL:
      let open_schedule_config = {};
      open_schedule_config.viewing_event = true;
      open_schedule_config.defaults = payload.defaults;
      open_schedule_config.updating = payload.updating;
      open_schedule_config.viewing = payload.viewing;
      return { ...state, ...open_schedule_config };
    case CLOSE_SCHEDULE_MODAL:
      let close_schedule_config = {};
      close_schedule_config.viewing_event = false;
      close_schedule_config.defaults = {};
      close_schedule_config.updating = false;
      close_schedule_config.viewing = false;
      return { ...state, ...close_schedule_config };
    case OPEN_VIEW_SCHEDULE_MODAL:
      return { ...state, viewing_schedule: true };
    case CLOSE_VIEW_SCHEDULE_MODAL:
      return { ...state, viewing_schedule: false };
    case IS_FETCHING_EVENTS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_EVENTS:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default scheduleReducer;
