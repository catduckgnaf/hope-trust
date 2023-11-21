import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import {
  IS_FETCHING_SECURITY_QUESTIONS,
  IS_FETCHING_SECURITY_RESPONSES,
  GET_SECURITY_QUESTIONS,
  GET_SECURITY_QUESTION_RESPONSES,
  CREATE_SECURITY_QUESTION_RESPONSE,
  HAS_REQUESTED_SECURITY_QUESTIONS,
  HAS_REQUESTED_SECURITY_QUESTION_RESPONSES
} from "./constants";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const default_categories = [
  { label: "Family", value: "family" },
  { label: "Favorites", value: "favorites" },
  { label: "About You", value: "about You" }
];

export const getSecurityQuestions = (override = false) => async (dispatch) => {
  if ((!store.getState().security.isFetching && !store.getState().security.requested) || override) {
    dispatch({ type: IS_FETCHING_SECURITY_QUESTIONS, payload: true });
    try {
      const questions = await API.get(
        Gateway.name,
        `/security-questions/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (questions.success) {
        dispatch({ type: GET_SECURITY_QUESTIONS, payload: questions.payload });
        dispatch({ type: IS_FETCHING_SECURITY_QUESTIONS, payload: false });
        return questions.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_SECURITY_QUESTIONS, payload: true });
        dispatch({ type: IS_FETCHING_SECURITY_QUESTIONS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_SECURITY_QUESTIONS, payload: true });
      dispatch({ type: IS_FETCHING_SECURITY_QUESTIONS, payload: false });
    }
  }
};

export const getUserSecurityQuestionResponses = () => async (dispatch) => {
  if (!store.getState().security.isFetchingResponses && !store.getState().security.requestedResponses) {
    dispatch({ type: IS_FETCHING_SECURITY_RESPONSES, payload: true });
    try {
      const responses = await API.get(
        Gateway.name,
        `/security-questions/user/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (responses.success) {
        dispatch({ type: GET_SECURITY_QUESTION_RESPONSES, payload: responses.payload });
        dispatch({ type: IS_FETCHING_SECURITY_RESPONSES, payload: false });
        return responses.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_SECURITY_QUESTION_RESPONSES, payload: true });
        dispatch({ type: IS_FETCHING_SECURITY_RESPONSES, payload: false });
      }
    } catch ( error) {
      dispatch({ type: HAS_REQUESTED_SECURITY_QUESTION_RESPONSES, payload: true });
      dispatch({ type: IS_FETCHING_SECURITY_RESPONSES, payload: false });
    }
  }
};

export const createSecurityQuestionResponse = (response, question_id) => async (dispatch) => {
  const created = await API.post(
    Gateway.name,
    `/security-questions/response/create/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        answer: response,
        question_id
      }
    });
  if (created.success) {
    dispatch({ type: CREATE_SECURITY_QUESTION_RESPONSE, payload: created.payload });
    return { success: true };
  } else {
    return { success: false };
  }
};