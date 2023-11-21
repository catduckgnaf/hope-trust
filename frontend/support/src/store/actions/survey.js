import {
  GET_SURVEYS,
  GET_SESSIONS,
  CREATE_SURVEY,
  UPDATE_SURVEY,
  DELETE_SURVEY,
  DELETE_SURVEYS,
  UPDATE_SESSION,
  DELETE_SESSION,
  DELETE_SESSIONS,
  IS_FETCHING_SURVEYS,
  IS_FETCHING_SESSIONS,
  HAS_REQUESTED_SURVEYS,
  HAS_REQUESTED_SESSIONS,
  CHANGE_SURVEY_TAB,
  OPEN_CREATE_SURVEY_MODAL,
  CLOSE_CREATE_SURVEY_MODAL,
  OPEN_CREATE_SESSION_MODAL,
  CLOSE_CREATE_SESSION_MODAL
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { showNotification } from "./notification";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getSurveys = (override = false) => async (dispatch) => {
  if ((!store.getState().survey.isFetching && !store.getState().survey.requested) || override) {
    dispatch({ type: IS_FETCHING_SURVEYS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/survey/get-surveys/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_SURVEYS, payload: data.payload });
        dispatch({ type: IS_FETCHING_SURVEYS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_SURVEYS, payload: true });
        dispatch({ type: IS_FETCHING_SURVEYS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_SURVEYS, payload: [] });
      dispatch({ type: HAS_REQUESTED_SURVEYS, payload: true });
      dispatch({ type: IS_FETCHING_SURVEYS, payload: false });
      return { success: false };
    }
  }
};
export const getSurveySessions = (override = false) => async (dispatch) => {
  if ((!store.getState().survey.isFetchingSessions && !store.getState().survey.requestedSessions) || override) {
    dispatch({ type: IS_FETCHING_SESSIONS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/survey/get-sessions/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_SESSIONS, payload: data.payload });
        dispatch({ type: IS_FETCHING_SESSIONS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_SESSIONS, payload: true });
        dispatch({ type: IS_FETCHING_SESSIONS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_SESSIONS, payload: [] });
      dispatch({ type: HAS_REQUESTED_SESSIONS, payload: true });
      dispatch({ type: IS_FETCHING_SESSIONS, payload: false });
      return { success: false };
    }
  }
};
export const createSurvey = (newSurvey) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/survey/create-survey/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newSurvey
      }
    }).then((data) => {
      dispatch({ type: CREATE_SURVEY, payload: data.payload });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      dispatch(showNotification("error", "Error", error.response.data.message));
      return { success: false };
    });
};

export const updateSurvey = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/survey/update-survey/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: UPDATE_SURVEY, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      dispatch(showNotification("error", "Error", error.response.data.message));
      return { success: false };
    });
};
export const deleteSurvey = (ID) => async (dispatch) => {
  return API.del(
    Gateway.name,
    `/survey/delete-survey/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      dispatch({ type: DELETE_SURVEY, payload: ID });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      dispatch(showNotification("error", "Error", error.response.data.message));
      return { success: false };
    });
};
export const deleteSurveys = (survey_ids) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/survey/delete-surveys/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        survey_ids
      }
    }).then((data) => {
      if (data.payload.failed) dispatch(showNotification("error", "Delete Failed", `Could not delete ${data.payload.failed.length} of ${survey_ids.length} ${survey_ids.length === 1 ? "survey" : "surveys"}.`));
      else dispatch(showNotification("success", "Records Deleted", `Successfully deleted ${data.payload.success.length} of ${survey_ids.length} ${survey_ids.length === 1 ? "survey" : "surveys"}.`));
      dispatch({ type: DELETE_SURVEYS, payload: data.payload.success });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const updateSession = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/survey/update-session/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: UPDATE_SESSION, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      dispatch(showNotification("error", "Error", error.response.data.message));
      return { success: false };
    });
};
export const deleteSession = (ID) => async (dispatch) => {
  return API.del(
    Gateway.name,
    `/survey/delete-session/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      dispatch({ type: DELETE_SESSION, payload: ID });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      dispatch(showNotification("error", "Error", error.response.data.message));
      return { success: false };
    });
};
export const deleteSessions = (session_ids) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/survey/delete-sessions/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        session_ids
      }
    }).then((data) => {
      if (data.payload.failed) dispatch(showNotification("error", "Delete Failed", `Could not delete ${data.payload.failed.length} of ${session_ids.length} ${session_ids.length === 1 ? "session" : "sessions"}.`));
      else dispatch(showNotification("success", "Records Deleted", `Successfully deleted ${data.payload.success.length} of ${session_ids.length} ${session_ids.length === 1 ? "session" : "sessions"}.`));
      dispatch({ type: DELETE_SESSIONS, payload: data.payload.success });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const changeSurveyTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_SURVEY_TAB, payload: tab });
};

export const openCreateSurveyModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_SURVEY_MODAL, payload: { defaults, updating, viewing } });
};

export const closeCreateSurveyModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_SURVEY_MODAL });
};

export const openCreateSessionModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_SESSION_MODAL, payload: { defaults, updating, viewing } });
};

export const closeCreateSessionModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_SESSION_MODAL });
};