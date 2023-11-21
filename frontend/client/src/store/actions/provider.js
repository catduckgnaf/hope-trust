import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import { IS_FETCHING_PROVIDERS, HAS_REQUESTED_PROVIDERS, GET_PROVIDERS, UPDATE_PROVIDERS, DELETE_PROVIDER, OPEN_CREATE_PROVIDER_MODAL, CLOSE_CREATE_PROVIDER_MODAL } from "../actions/constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getProviders = (override = false) => async (dispatch) => {
  if ((!store.getState().provider.isFetching && !store.getState().provider.requested) || override) {
    dispatch({ type: IS_FETCHING_PROVIDERS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/providers/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_PROVIDERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_PROVIDERS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_PROVIDERS, payload: true });
        dispatch({ type: IS_FETCHING_PROVIDERS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_PROVIDERS, payload: true });
      dispatch({ type: IS_FETCHING_PROVIDERS, payload: false });
    }
  }
};


export const createProvider = (provider) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/providers/create/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "newProvider": provider
      }
    }).then((data) => {
      if (data.success) {
        dispatch({ type: UPDATE_PROVIDERS, payload: data.payload });
      }
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateProvider = (ID, provider) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/providers/update-single-provider/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "newProvider": provider
      }
    }).then((data) => {
      if (data.success) {
        dispatch({ type: UPDATE_PROVIDERS, payload: data.payload });
      }
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteProviderRecord = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_PROVIDER, payload: ID });
  return API.del(
    Gateway.name,
    `/providers/delete-single-provider/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const openCreateProviderModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_PROVIDER_MODAL, payload: { defaults, updating, viewing, current_page } });
  dispatch(logEvent("provider", store.getState().user, "modal"));
};
export const closeCreateProviderModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_PROVIDER_MODAL });
};

export const provider_networks = [
  "Aetna",
  "Anthem, Inc.",
  "Blue Cross Blue Shield (BCBS)",
  "Carefirst",
  "Caresource",
  "Centene Corp.",
  "Cigna Health",
  "CVS Health",
  "Emblem Health",
  "Guidewell Mutual Health",
  "Health Care Service Corporation (HCHS)",
  "HealthPartners",
  "Highmark",
  "Humana",
  "Independence Health Group",
  "Kaiser Permanente",
  "Medicaid",
  "Medicare",
  "Metropolitan",
  "Molina Healthcare", 
  "United Healthcare Group",
  "UPMC Health System",
  "WellCare Health Plans",
  "Wellmark",
].sort();