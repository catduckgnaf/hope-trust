import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import {
  IS_FETCHING_CORE_SETTINGS,
  HAS_REQUESTED_CORE_SETTINGS,
  GET_CORE_SETTINGS
} from "./constants";
import { store } from "..";

const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getCoreSettings = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingCoreSettings && !store.getState().customer_support.requestedCoreSettings) || override) {
    dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: true });
    return API.get(Gateway.name, "/accounts/get-core-settings")
    .then((data) => {
      dispatch({ type: GET_CORE_SETTINGS, payload: data.payload });
      dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: false });
      if (data.payload.client_debug) window.LOG_LEVEL = "DEBUG";
      return data.payload;
    })
    .catch((error) => {
      dispatch({ type: HAS_REQUESTED_CORE_SETTINGS, payload: true });
      dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: false });
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
  }
};