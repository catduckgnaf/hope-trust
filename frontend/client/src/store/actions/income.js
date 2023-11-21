import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import {
  GET_ACCOUNT_INCOME,
  CREATE_INCOME_RECORD,
  UPDATE_INCOME_RECORD,
  DELETE_INCOME_RECORD,
  OPEN_CREATE_INCOME_MODAL,
  CLOSE_CREATE_INCOME_MODAL,
  IS_FETCHING_INCOME,
  HAS_REQUESTED_INCOME
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getIncome = (override) => async (dispatch) => {
  if ((!store.getState().income.isFetching && !store.getState().income.requested) || override) {
    dispatch({ type: IS_FETCHING_INCOME, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/finance/get-income/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_ACCOUNT_INCOME, payload: data.payload });
        dispatch({ type: IS_FETCHING_INCOME, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_INCOME, payload: true });
        dispatch({ type: IS_FETCHING_INCOME, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_INCOME, payload: true });
      dispatch({ type: IS_FETCHING_INCOME, payload: false });
    }
  }
};

export const createIncomeRecord = (newFinance) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/finance/create-single-income/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newFinance
      }
    }).then((data) => {
      dispatch({ type: CREATE_INCOME_RECORD, payload: { data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateIncomeRecord = (ID, newFinance) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/finance/update-single-income/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "updates": newFinance
      }
    }).then((data) => {
      dispatch({ type: UPDATE_INCOME_RECORD, payload: { ID, data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteIncomeRecord = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_INCOME_RECORD, payload: ID });
  return API.del(
    Gateway.name,
    `/finance/delete-single-income/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const openCreateIncomeModal = (defaults, updating, viewing, simulation) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_INCOME_MODAL, payload: { defaults, updating, viewing, simulation } });
  dispatch(logEvent("income-source", store.getState().user, "modal"));
};

export const closeCreateIncomeModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_INCOME_MODAL });
};