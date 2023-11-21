import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import {
  GET_ACCOUNT_BUDGETS,
  CREATE_BUDGET_RECORD,
  UPDATE_BUDGET_RECORD,
  DELETE_BUDGET_RECORD,
  OPEN_CREATE_BUDGET_MODAL,
  CLOSE_CREATE_BUDGET_MODAL,
  IS_FETCHING_BUDGETS,
  HAS_REQUESTED_BUDGETS
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getBudget = (override) => async (dispatch) => {
  if ((!store.getState().budgets.isFetching && !store.getState().budgets.requested) || override) {
    dispatch({ type: IS_FETCHING_BUDGETS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/finance/get-budgets/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_ACCOUNT_BUDGETS, payload: data.payload });
        dispatch({ type: IS_FETCHING_BUDGETS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_BUDGETS, payload: true });
        dispatch({ type: IS_FETCHING_BUDGETS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_BUDGETS, payload: true });
      dispatch({ type: IS_FETCHING_BUDGETS, payload: false });
    }
  }
};

export const createBudgetRecord = (newFinance) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/finance/create-single-budget/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newFinance
      }
    }).then((data) => {
      dispatch({ type: CREATE_BUDGET_RECORD, payload: { data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateBudgetRecord = (ID, newFinance) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/finance/update-single-budget/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "updates": newFinance
      }
    }).then((data) => {
      dispatch({ type: UPDATE_BUDGET_RECORD, payload: { ID, data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteBudgetRecord = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_BUDGET_RECORD, payload: ID });
  return API.del(
    Gateway.name,
    `/finance/delete-single-budget/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const openCreateBudgetModal = (defaults, updating, viewing, simulation) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_BUDGET_MODAL, payload: { defaults, updating, viewing, simulation } });
  dispatch(logEvent("expense", store.getState().user, "modal"));
};

export const closeCreateBudgetModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_BUDGET_MODAL });
};