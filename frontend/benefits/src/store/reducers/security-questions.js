import {
  IS_FETCHING_SECURITY_RESPONSES,
  IS_FETCHING_SECURITY_QUESTIONS,
  GET_SECURITY_QUESTIONS,
  GET_SECURITY_QUESTION_RESPONSES,
  CREATE_SECURITY_QUESTION_RESPONSE,
  HAS_REQUESTED_SECURITY_QUESTIONS,
  HAS_REQUESTED_SECURITY_QUESTION_RESPONSES,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  questions: [],
  responses: [],
  isFetching: false,
  isFetchingResponses: false,
  requested: false,
  requestedResponses: false,
  creating_question: false,
  defaults: {},
  updating: false,
  viewing: false
};
const securityQuestionsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case CREATE_SECURITY_QUESTION_RESPONSE:
      const current_responses = state.responses;
      let new_responses = current_responses.filter((r) => r.question_id !== payload.question_id);
      return { ...state, responses: [ ...new_responses, payload ] };
    case GET_SECURITY_QUESTIONS:
      return { ...state, questions: payload, isFetching: false, requested: true };
    case GET_SECURITY_QUESTION_RESPONSES:
      return { ...state, responses: payload, isFetchingResponses: false, requestedResponses: true };
    case IS_FETCHING_SECURITY_QUESTIONS:
      return { ...state, isFetching: payload };
    case IS_FETCHING_SECURITY_RESPONSES:
      return { ...state, isFetchingResponses: payload };
    case HAS_REQUESTED_SECURITY_QUESTIONS:
      return { ...state, requested: payload };
    case HAS_REQUESTED_SECURITY_QUESTION_RESPONSES:
      return { ...state, requestedResponses: payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default securityQuestionsReducer;
