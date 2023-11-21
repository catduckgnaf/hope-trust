import {
  IS_FETCHING_SECURITY_QUESTIONS,
  GET_SECURITY_QUESTIONS,
  CREATE_SECURITY_QUESTION,
  UPDATE_SECURITY_QUESTIONS,
  UPDATE_SECURITY_QUESTION,
  DELETE_SECURITY_QUESTION,
  OPEN_CREATE_SECURITY_QUESTON_MODAL,
  CLOSE_CREATE_SECURITY_QUESTON_MODAL,
  HAS_REQUESTED_SECURITY_QUESTIONS,
  OPEN_SECURITY_QUESTON_RESPONSE_MODAL,
  CLOSE_SECURITY_QUESTON_RESPONSE_MODAL,
  LOCATION_CHANGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  questions: [],
  isFetching: false,
  requested: false,
  creating_question: false,
  viewing_response: false,
  defaults: {},
  updating: false,
  viewing: false
};
const securityQuestionsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_SECURITY_QUESTIONS:
      return { ...state, questions: payload };
    case GET_SECURITY_QUESTIONS:
      return { ...state, questions: payload, isFetching: false, requested: true };
    case CREATE_SECURITY_QUESTION:
      return { ...state, questions: [payload, ...state.questions] };
    case UPDATE_SECURITY_QUESTION:
      const updatable = state.questions.filter((p) => p.id !== payload.id);
      return { ...state, questions: [payload, ...updatable] };
    case DELETE_SECURITY_QUESTION:
      const preserved_questions = state.questions.filter((p) => p.id !== payload);
      return { ...state, questions: preserved_questions };
    case OPEN_CREATE_SECURITY_QUESTON_MODAL:
      return { ...state, creating_question: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CREATE_SECURITY_QUESTON_MODAL:
      return { ...state, creating_question: false, defaults: {}, updating: false, viewing: false };
    case OPEN_SECURITY_QUESTON_RESPONSE_MODAL:
      return { ...state, viewing_response: true, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_SECURITY_QUESTON_RESPONSE_MODAL:
      return { ...state, viewing_response: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_SECURITY_QUESTIONS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_SECURITY_QUESTIONS:
      return { ...state, requested: payload };
    case LOCATION_CHANGE:
      return { ...state, viewing_response: false, creating_question: false, defaults: {}, updating: false, viewing: false };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default securityQuestionsReducer;
