import {
  GET_RETAILERS,
  IS_FETCHING_RETAILERS,
  HAS_REQUESTED_RETAILERS
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";

export const getRetailers = (override = false) => async (dispatch) => {
  if ((!store.getState().retail.isFetching && !store.getState().retail.requested) || override) {
    dispatch({ type: IS_FETCHING_RETAILERS, payload: true });
    try {
      const data = await API.post(
      apiGateway.NAME,
      `/retail/get-retailers/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        body: {
          config_id: store.getState().user.benefits_data.config_id,
          type: store.getState().user.benefits_data.type,
          parent_id: store.getState().user.benefits_data.parent_id
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
export const getPublicRetailers = (override = false) => async (dispatch) => {
  if ((!store.getState().retail.isFetching && !store.getState().retail.requested) || override) {
    dispatch({ type: IS_FETCHING_RETAILERS, payload: true });
    try {
      const data = await API.get(
      apiGateway.NAME,
      "/retail/get-public-retailers",
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
export const createRetailer = (newRetailer, addition) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/retail/create-single-retailer/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newRetailer,
        addition
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateRetailer = (ID, updatedRetailer) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/retail/update-single-retailer/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedRetailer
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};