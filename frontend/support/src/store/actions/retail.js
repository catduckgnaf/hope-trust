import {
  GET_RETAILERS,
  ADD_RETAILER,
  DELETE_RETAILER,
  EDIT_RETAILER,
  IS_FETCHING_RETAILERS,
  HAS_REQUESTED_RETAILERS,
  OPEN_RETAIL_MODAL,
  CLOSE_RETAIL_MODAL
} from "../actions/constants";
import { getAgents } from "./agents";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getRetailers = (override = false) => async (dispatch) => {
  if ((!store.getState().retail.isFetching && !store.getState().retail.requested) || override) {
    dispatch({ type: IS_FETCHING_RETAILERS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/retail/get-retailers/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_RETAILERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_RETAILERS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_RETAILERS, payload: true });
        dispatch({ type: IS_FETCHING_RETAILERS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_RETAILERS, payload: [] });
      dispatch({ type: HAS_REQUESTED_RETAILERS, payload: true });
      dispatch({ type: IS_FETCHING_RETAILERS, payload: false });
      return { success: false };
    }
  }
};
export const createRetailer = (newRetailer, is_additional_account) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/retail/create-single-retailer/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newRetailer,
        is_additional_account
      }
    }).then((data) => {
      dispatch({ type: ADD_RETAILER, payload: data.payload });
      dispatch(getAgents(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateRetailer = (ID, update_data) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/retail/update-single-retailer/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        update_data
      }
    }).then((data) => {
      dispatch({ type: EDIT_RETAILER, payload: data.payload });
      
      if (update_data.new_cognito_id) dispatch(getAgents(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteRetailer = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_RETAILER, payload: ID });
  return API.del(
    Gateway.name,
    `/retail/delete-single-retailer/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const openCreateRetailModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_RETAIL_MODAL, payload: { defaults, updating, viewing, current_page }});
};

export const closeCreateRetailModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_RETAIL_MODAL });
};