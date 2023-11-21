import {
  GET_QUIZ_RESPONSES,
  IS_FETCHING_QUIZ_RESPONSES,
  HAS_REQUESTED_QUIZ_RESPONSES,
  GET_QUIZ_RESPONSE,
  IS_LOGGED_IN,
  OPEN_QUIZ,
  CLOSE_QUIZ,
  OPEN_QUIZ_VIDEO,
  CLOSE_QUIZ_VIDEO,
  CREATE_PARTNER_RESPONSE,
  UPDATE_PARTNER_RESPONSE,
  OPEN_STUDENT_ATTESTATION,
  CLOSE_STUDENT_ATTESTATION,
  OPEN_PROCTOR_FORM,
  CLOSE_PROCTOR_FORM
} from "./constants";
import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getQuizResponses = (override) => async (dispatch) => {
  if ((!store.getState().class_marker.isFetching && !store.getState().class_marker.requested) || override) {
    dispatch({ type: IS_FETCHING_QUIZ_RESPONSES, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/partners/get-partner-responses/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_QUIZ_RESPONSES, payload: data.payload });
        dispatch({ type: IS_FETCHING_QUIZ_RESPONSES, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_QUIZ_RESPONSES, payload: true });
        dispatch({ type: IS_FETCHING_QUIZ_RESPONSES, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_QUIZ_RESPONSES, payload: true });
      dispatch({ type: IS_FETCHING_QUIZ_RESPONSES, payload: false });
    }
  }
};

export const getQuizResponse = (quiz_id) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/partners/get-partner-response/${quiz_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      dispatch({ type: GET_QUIZ_RESPONSE, payload: data.payload });
      return Auth.currentAuthenticatedUser({ bypassCache: true })
        .then(async (user) => {
          const token = user.signInUserSession.idToken.jwtToken;
          const storedUser = await API.get(Gateway.name, `/users/${user.username}`, { headers: { Authorization: token } });
          if (storedUser.success) dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
          return { success: true, quiz: data.payload };
        })
        .catch((error) => {
          return { success: false };
        });
    }).catch((error) => {
      dispatch({ type: GET_QUIZ_RESPONSE });
      return {
        success: false,
        error
      };
    });
};

export const createQuizResponse = (newQuizResponse) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/partners/create-partner-response/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newQuizResponse
      }
    }).then((data) => {
      if (data.success) dispatch({ type: CREATE_PARTNER_RESPONSE, payload: data.payload });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateQuizResponse = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/partners/update-partner-response/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) {
        dispatch(showNotification("success", "Course Updated", data.message));
        dispatch({ type: UPDATE_PARTNER_RESPONSE, payload: data.payload });
      }
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const openQuiz = (quiz, state = null) => async (dispatch) => {
  dispatch({ type: OPEN_QUIZ, payload: { quiz, state } });
};

export const closeQuiz = (quiz) => async (dispatch) => {
  dispatch({ type: CLOSE_QUIZ, payload: quiz });
};

export const openQuizAttestation = (quiz) => async (dispatch) => {
  dispatch({ type: OPEN_STUDENT_ATTESTATION, payload: quiz });
};

export const closeQuizAttestation = () => async (dispatch) => {
  dispatch({ type: CLOSE_STUDENT_ATTESTATION });
};

export const openProctorForm = () => async (dispatch) => {
  dispatch({ type: OPEN_PROCTOR_FORM });
};

export const closeProctorForm = () => async (dispatch) => {
  dispatch({ type: CLOSE_PROCTOR_FORM });
};

export const openQuizVideo = (active_video_id, active_video_title, quiz) => async (dispatch) => {
  dispatch({ type: OPEN_QUIZ_VIDEO, payload: { active_video_id, active_video_title, quiz } });
};

export const closeQuizVideo = () => async (dispatch) => {
  dispatch({ type: CLOSE_QUIZ_VIDEO });
};