import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import {
  IS_FETCHING_SECURITY_QUESTIONS,
  GET_SECURITY_QUESTIONS,
  CREATE_SECURITY_QUESTION,
  UPDATE_SECURITY_QUESTION,
  DELETE_SECURITY_QUESTION,
  OPEN_CREATE_SECURITY_QUESTON_MODAL,
  CLOSE_CREATE_SECURITY_QUESTON_MODAL,
  HAS_REQUESTED_SECURITY_QUESTIONS,
  OPEN_SECURITY_QUESTON_RESPONSE_MODAL,
  CLOSE_SECURITY_QUESTON_RESPONSE_MODAL
} from "./constants";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

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

export const getUserSecurityQuestionResponse = (question_id, cognito_id) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/security-questions/get-security-question-response/${question_id}/${cognito_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return { success: false };
    });
};

export const createSecurityQuestion = (newQuestion) => async (dispatch) => {
  const created = await API.post(
    Gateway.name,
    `/security-questions/question/create/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newQuestion
      }
    });
  if (created.success) dispatch({ type: CREATE_SECURITY_QUESTION, payload: created.payload });
  return created;
};

export const updateSecurityQuestionRecord = (ID, newQuestion) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/security-questions/update-security-question/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newQuestion
      }
    }).then((data) => {
      if (data.success) dispatch({ type: UPDATE_SECURITY_QUESTION, payload: data.payload });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteSecurityQuestionRecord = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_SECURITY_QUESTION, payload: ID });
  return API.del(
    Gateway.name,
    `/security-questions/delete-security-question/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const openSecurityQuestionResponseModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_SECURITY_QUESTON_RESPONSE_MODAL, payload: { defaults, updating, viewing } });
};
export const closeSecurityQuestionResponseModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_SECURITY_QUESTON_RESPONSE_MODAL });
};

export const openCreateSecurityQuestionModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_SECURITY_QUESTON_MODAL, payload: { defaults, updating, viewing, current_page } });
};
export const closeCreateSecurityQuestionModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_SECURITY_QUESTON_MODAL });
};