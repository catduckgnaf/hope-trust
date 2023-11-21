import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import {
  GET_ACCOUNT_BENEFITS,
  CREATE_BENEFIT_RECORD,
  UPDATE_BENEFIT_RECORD,
  DELETE_BENEFIT_RECORD,
  OPEN_CREATE_BENEFIT_MODAL,
  CLOSE_CREATE_BENEFIT_MODAL,
  IS_FETCHING_BENEFITS,
  HAS_REQUESTED_BENEFITS
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getBenefits = (override) => async (dispatch) => {
  if ((!store.getState().benefits.isFetching && !store.getState().benefits.requested) || override) {
    dispatch({ type: IS_FETCHING_BENEFITS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/finance/get-benefits/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_ACCOUNT_BENEFITS, payload: data.payload });
        dispatch({ type: IS_FETCHING_BENEFITS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_BENEFITS, payload: true });
        dispatch({ type: IS_FETCHING_BENEFITS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_BENEFITS, payload: true });
      dispatch({ type: IS_FETCHING_BENEFITS, payload: false });
    }
  }
};

export const createBenefitRecord = (newFinance) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/finance/create-single-benefit/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newFinance
      }
    }).then((data) => {
      dispatch({ type: CREATE_BENEFIT_RECORD, payload: { data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateBenefitRecord = (ID, newFinance) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/finance/update-single-benefit/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "updates": newFinance
      }
    }).then((data) => {
      dispatch({ type: UPDATE_BENEFIT_RECORD, payload: { ID, data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteBenefitRecord = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_BENEFIT_RECORD, payload: ID });
  return API.del(
    Gateway.name,
    `/finance/delete-single-benefit/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const openCreateBenefitModal = (defaults, updating, viewing, simulation) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_BENEFIT_MODAL, payload: { defaults, updating, viewing, simulation } });
  dispatch(logEvent("benefit", store.getState().user, "modal"));
};

export const closeCreateBenefitModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_BENEFIT_MODAL });
};