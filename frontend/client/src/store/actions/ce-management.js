import {
  GET_CE_CONFIGS,
  IS_FETCHING_CE_CONFIGS,
  HAS_REQUESTED_CE_CONFIGS,
  GET_CE_COURSES,
  IS_FETCHING_CE_COURSES,
  HAS_REQUESTED_CE_COURSES
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { getQuizResponses } from "./class-marker";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getCEConfigs = (override = false) => async (dispatch) => {
  if ((!store.getState().ce_config.isFetching && !store.getState().ce_config.requested) || override) {
    dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/ce/get-ce-configs/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_CE_CONFIGS, payload: data.payload });
        dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_CE_CONFIGS, payload: true });
        dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_CE_CONFIGS, payload: [] });
      dispatch({ type: HAS_REQUESTED_CE_CONFIGS, payload: true });
      dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: false });
      return { success: false };
    }
  }
};
export const getCECourses = (organization, partner_type, override = false) => async (dispatch) => {
  if ((!store.getState().ce_config.isFetchingCourses && !store.getState().ce_config.requestedCourses) || override) {
    dispatch({ type: IS_FETCHING_CE_COURSES, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/ce/get-ce-courses/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          },
          queryStringParameters: {
            organization,
            partner_type
          }
        });
      if (data.success) {
        dispatch({ type: GET_CE_COURSES, payload: data.payload });
        dispatch({ type: IS_FETCHING_CE_COURSES, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_CE_COURSES, payload: true });
        dispatch({ type: IS_FETCHING_CE_COURSES, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_CE_COURSES, payload: [] });
      dispatch({ type: HAS_REQUESTED_CE_COURSES, payload: true });
      dispatch({ type: IS_FETCHING_CE_COURSES, payload: false });
      return { success: false };
    }
  }
};

export const createOrUpdateCEQuiz = (updates, quiz_id) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/ce/create-or-update-ce-quiz/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates,
        quiz_id
      }
    }).then((data) => {
      dispatch(getQuizResponses(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};