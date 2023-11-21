import {
  GET_QUIZ_RESPONSES,
  IS_FETCHING_QUIZ_RESPONSES,
  HAS_REQUESTED_QUIZ_RESPONSES,
  GET_QUIZ_RESPONSE,
  OPEN_QUIZ,
  CLOSE_QUIZ,
  OPEN_QUIZ_VIDEO,
  CLOSE_QUIZ_VIDEO,
  CREATE_PARTNER_RESPONSE,
  UPDATE_PARTNER_RESPONSE,
  OPEN_STUDENT_ATTESTATION,
  CLOSE_STUDENT_ATTESTATION,
  OPEN_PROCTOR_FORM,
  CLOSE_PROCTOR_FORM,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";

const defaultState = {
  responses: [],
  show: false,
  show_video: false,
  show_student_attestation: false,
  show_proctor_form: false,
  active_video_id: null,
  active_video_title: "",
  focus: null,
  isFetching: false,
  requested: false,
  loading: null
};

const classMarkerReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_QUIZ_RESPONSES:
      return { ...state, responses: payload, isFetching: false, requested: true };
    case GET_QUIZ_RESPONSE:
      const old_responses = payload ? state.responses.filter((quiz) => quiz.quiz_id !== payload.quiz_id) : state.responses;
      const new_responses = payload ? [...old_responses, payload] : old_responses;
      return { ...state, responses: new_responses, loading: null };
    case IS_FETCHING_QUIZ_RESPONSES:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_QUIZ_RESPONSES:
      return { ...state, requested: payload };
    case CREATE_PARTNER_RESPONSE:
      return { ...state, responses: [payload, ...state.responses] };
    case UPDATE_PARTNER_RESPONSE:
      const old_responses_before_edit = state.responses;
      const new_responses_after_edit = old_responses_before_edit.filter((response) => response.id !== payload.id);
      return { ...state, responses: [...new_responses_after_edit, payload] };
    case OPEN_QUIZ:
      return { ...state, show: true, focus: { ...payload.quiz, state: payload.state }, show_proctor_form: false, show_student_attestation: false };
    case CLOSE_QUIZ:
      return { ...state, show: false, focus: (payload.state && payload.state.proctor_required) ? state.focus : null };
    case OPEN_PROCTOR_FORM:
      return { ...state, show_proctor_form: true, show_student_attestation: false, show: false };
    case CLOSE_PROCTOR_FORM:
      return { ...state, show_proctor_form: false, focus: null, loading: null };
    case OPEN_STUDENT_ATTESTATION:
      return { ...state, show_student_attestation: true, focus: payload };
    case CLOSE_STUDENT_ATTESTATION:
      return { ...state, show_student_attestation: false };
    case OPEN_QUIZ_VIDEO:
      return { ...state, show_video: true, focus: payload.quiz, active_video_id: payload.active_video_id, active_video_title: payload.active_video_title };
    case CLOSE_QUIZ_VIDEO:
      return { ...state, show_video: false, active_video_id: null, active_video_title: "" };
    case "CLEAR_QUIZ":
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default classMarkerReducer;
