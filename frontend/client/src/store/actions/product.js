import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import {
  IS_FETCHING_PRODUCTS,
  GET_PRODUCTS,
  HAS_REQUESTED_PRODUCTS,
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getProducts = (params, override = false) => async (dispatch) => {
  if (((!store.getState().account.isFetchingProducts && !store.getState().account.requestedProducts) || override)) {
    dispatch({ type: IS_FETCHING_PRODUCTS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/stripe/get-products/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          },
          queryStringParameters: {
            ...params
          }
        });
      if (data.success) {
        dispatch({ type: GET_PRODUCTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_PRODUCTS, payload: false });
        return data;
      } else {
        dispatch({ type: HAS_REQUESTED_PRODUCTS, payload: true });
        dispatch({ type: IS_FETCHING_PRODUCTS, payload: false });
        return data;
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_PRODUCTS, payload: true });
      dispatch({ type: IS_FETCHING_PRODUCTS, payload: false });
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    }
  }
};