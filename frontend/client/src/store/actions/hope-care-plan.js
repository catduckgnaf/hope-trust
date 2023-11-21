import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import { getDocuments } from "./document";
import { store } from "..";
import { toastr } from "react-redux-toastr";
import { logEvent } from "./utilities";
import {
  GET_SURVEYS,
  GET_SURVEY,
  SET_SURVEY,
  CLOSE_SURVEY,
  UPDATE_SURVEY_LOADING_STATE,
  IS_FETCHING_SURVEYS,
  IS_FETCHING_SURVEY,
  HAS_REQUESTED_SURVEYS,
  CONVERT_MARKDOWN,
  RETRY_SURVEY,
  RESET_RETRYS,
  CLOSE_PDF_MODAL
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

const getSessions = (override = false) => async (dispatch) => {
 if ((!store.getState().survey.isFetching && !store.getState().survey.requested) || override) {
   dispatch({ type: IS_FETCHING_SURVEYS, payload: true });
   return API.get(
     Gateway.name,
     `/survey-gizmo/get-survey-sessions/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
     {
       headers: {
         Authorization: store.getState().session.token
       }
     })
     .then((data) => {
       dispatch({ type: GET_SURVEYS, payload: data.payload });
       dispatch({ type: IS_FETCHING_SURVEYS, payload: false });
       return data;
     })
     .catch((error) => {
       dispatch({ type: GET_SURVEYS, payload: [] });
       dispatch({ type: HAS_REQUESTED_SURVEYS, payload: true });
       dispatch({ type: IS_FETCHING_SURVEYS, payload: false });
       return {
         success: false,
         error
       };
     });
  }
};

const getSession = (survey_id, survey_name, project_ids, collection_ids) => async (dispatch) => {
  dispatch({ type: IS_FETCHING_SURVEY, payload: true });
  return API.post(
    Gateway.name,
    `/survey-gizmo/get-survey-session/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        survey_id,
        survey_name,
        project_ids,
        collection_ids,
        is_test: false
      }
    }).then((data) => {
      if (data.success && data.log.every((l) => l)) {
        dispatch({ type: GET_SURVEY, payload: data.payload });
        dispatch({ type: UPDATE_SURVEY_LOADING_STATE, payload: "" });
        dispatch({ type: IS_FETCHING_SURVEY, payload: false });
        return data.payload;
      } else if (data.log.some((l) => !l)) {
        if (store.getState().survey.retrys < store.getState().survey.max_retrys) {
          dispatch({ type: RETRY_SURVEY });
          dispatch(getSession(survey_id, survey_name, project_ids, collection_ids));
        } else if (store.getState().survey.retrys >= store.getState().survey.max_retrys) {
          dispatch({ type: RESET_RETRYS });
          dispatch(showNotification("error", "Simulation failed", "Something went wrong. Please run your simulation again."));
        }
      }
      dispatch({ type: IS_FETCHING_SURVEY, payload: false });
    }).catch((error) => {
      if (store.getState().survey.retrys < store.getState().survey.max_retrys) {
        dispatch({ type: RETRY_SURVEY });
        dispatch(getSession(survey_id, survey_name, project_ids, collection_ids));
      } else if (store.getState().survey.retrys >= store.getState().survey.max_retrys) {
        dispatch({ type: RESET_RETRYS });
      }
      dispatch({ type: IS_FETCHING_SURVEY, payload: false });
    });
};

const setSurvey = (survey) => async (dispatch) => {
  const user = store.getState().user;
  const relationships = store.getState().relationship.list;
  let currentUser = relationships.find((u) => u.cognito_id === user.cognito_id);
  let beneficiary = relationships.find((u) => u.type === "beneficiary");
  if (!currentUser || !beneficiary) {
    if (!currentUser) currentUser = relationships.find((u) => u.cognito_id === user.cognito_id);
    if (!beneficiary) beneficiary = relationships.find((u) => u.type === "beneficiary");
  }
  if (survey && currentUser && beneficiary) {
    dispatch(logEvent("survey opened", currentUser));
    dispatch({ type: SET_SURVEY, payload: { survey, currentUser, beneficiary } });
  } else {
    dispatch(showNotification("error", "Survey could not be opened.", "This survey is missing information, try again."));
  }
};

const closeSurvey = () => async (dispatch) => {
  dispatch({ type: CLOSE_SURVEY });
};

const saveCurrentSurvey = (survey) => async (dispatch) => {
  dispatch({ type: UPDATE_SURVEY_LOADING_STATE, payload: survey.survey_name });
  dispatch(getSession(survey.survey_id, survey.slug, survey.project_ids, survey.collection_ids));
  dispatch(getDocuments(true));
};

const buildDocument = (document_name, survey_ids) => async (dispatch) => {
  const user = store.getState().user;
  dispatch(showNotification("info", `Generating ${document_name}`, `Please wait while we assemble your ${document_name}.`));
  return API.post(
    Gateway.name,
    `/ax-semantics/generate-plan/${store.getState().session.account_id}/${user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        survey_ids
      }
    }).then(async (data) => {
      dispatch({ type: CONVERT_MARKDOWN, payload: { source: data.payload, title: document_name } });
      dispatch(logEvent(`pdf-preview/${document_name}`, user, "modal"));
    }).catch((error) => {
      dispatch({ type: CLOSE_PDF_MODAL, payload: "" });
      dispatch(showNotification("error", `Generating ${document_name}`, `We could not assemble your ${document_name.toLowerCase()}, please try again.`));
      return {
        success: false,
        error
      };
    });
};

const clearAccountSurvey = (survey) => async (dispatch) => {
  dispatch({ type: UPDATE_SURVEY_LOADING_STATE, payload: survey.survey_name });
  dispatch(showNotification("info", "Clearing survey data. Please wait..."));
  return API.del(
    Gateway.name,
    `/survey-gizmo/clear-account-survey/${survey.survey_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then(async (data) => {
      dispatch({ type: GET_SURVEY, payload: data.payload });
      dispatch({ type: UPDATE_SURVEY_LOADING_STATE, payload: "" });
      dispatch(showNotification("success", "Successfully cleared survey data."));
    }).catch((error) => {
      dispatch({ type: UPDATE_SURVEY_LOADING_STATE, payload: "" });
      dispatch(showNotification("error", "Something went wrong. Could not clear survey data."));
      return {
        success: false,
        error
      };
    });
};

const clearTrustSurvey = (survey) => async (dispatch) => {
  const clearOptions = {
    onOk: () => dispatch(clearAccountSurvey(survey)),
    onCancel: () => toastr.removeByType("confirms"),
    okText: "Clear Trust",
    cancelText: "Cancel"
  };
  toastr.confirm("Would you like to generate a new Trust? Your prior Trust document will be erased.\n\nThis action cannot be undone.", clearOptions);
};

const runCustomAction = (action, survey) => async (dispatch) => {
  switch (action) {
    case "CLEAR_TRUST_SURVEY":
      if (survey.session_id) {
        dispatch(clearTrustSurvey(survey));
      } else {
        dispatch(setSurvey(survey));
      }
      break;
    default:
      break;
  }
};

const checkSurveyStatus = () => {
  const application_status = store.getState().session.application_status;
  const survey = store.getState().survey;
  let status = (survey.status && survey.status.alchemer && ["critical", "major", "minor", "maintenance"].includes(survey.status.alchemer.status.indicator)) ? true : false;
  let data = survey;
  if (!status) {
    data = application_status;
    const components = application_status.components;
    const survey_taking = components ? components.find((c) => c.name === "Survey Taking") : false;
    status = (application_status.status && ["critical", "major", "minor", "maintenance"].includes(application_status.status.indicator) && survey_taking && ["under_maintenance", "degraded_performance", "partial_outage", "minor_outage", "major_outage"].includes(survey_taking.status)) ? true : false;
  }
  return { ...data, result: status };
};

export default {
  getSessions,
  getSession,
  setSurvey,
  buildDocument,
  closeSurvey,
  runCustomAction,
  saveCurrentSurvey,
  clearAccountSurvey,
  checkSurveyStatus
};
