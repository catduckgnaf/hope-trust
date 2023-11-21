import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import {
  GET_ACCOUNT_GRANTOR_ASSETS,
  CREATE_GRANTOR_ASSET_RECORD,
  UPDATE_GRANTOR_ASSET_RECORD,
  DELETE_GRANTOR_ASSET_RECORD,
  OPEN_CREATE_GRANTOR_ASSET_MODAL,
  CLOSE_CREATE_GRANTOR_ASSET_MODAL,
  IS_FETCHING_GRANTOR_ASSETS,
  HAS_REQUESTED_GRANTOR_ASSETS,
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getGrantorAssets = (override) => async (dispatch) => {
    if ((!store.getState().grantor_assets.isFetching && !store.getState().grantor_assets.requested) || override) {
      dispatch({ type: IS_FETCHING_GRANTOR_ASSETS, payload: true });
      try {
        const data = await API.get(
        Gateway.name,
        `/finance/get-grantor-assets/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
        if (data.success) {
          dispatch({ type: GET_ACCOUNT_GRANTOR_ASSETS, payload: { data: data.payload } });
          dispatch({ type: IS_FETCHING_GRANTOR_ASSETS, payload: false });
          return data.success;
        } else {
          dispatch({ type: HAS_REQUESTED_GRANTOR_ASSETS, payload: true });
          dispatch({ type: IS_FETCHING_GRANTOR_ASSETS, payload: false });
        }
      } catch(error) {
        dispatch({ type: HAS_REQUESTED_GRANTOR_ASSETS, payload: true });
        dispatch({ type: IS_FETCHING_GRANTOR_ASSETS, payload: false });
      }
    }
};

export const createGrantorAssetRecord = (type, newFinance) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/finance/create-single-grantor-asset/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newFinance
      }
    }).then((data) => {
      dispatch({ type: CREATE_GRANTOR_ASSET_RECORD, payload: { type, data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateGrantorAssetRecord = (ID, newFinance) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/finance/update-single-grantor-asset/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "updates": newFinance
      }
    }).then((data) => {
      dispatch({ type: UPDATE_GRANTOR_ASSET_RECORD, payload: { ID, data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteGrantorAssetRecord = (ID, plaid_item_id) => async (dispatch) => {
  dispatch({ type: DELETE_GRANTOR_ASSET_RECORD, payload: ID });
  return API.patch(
    Gateway.name,
    `/finance/delete-single-grantor-asset/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        plaid_item_id
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

export const openCreateGrantorAssetModal = (type, finance_type, source, defaults, updating, viewing, simulation) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_GRANTOR_ASSET_MODAL, payload: { type, finance_type, source, defaults, updating, viewing, simulation } });
  dispatch(logEvent("grantor-asset", store.getState().user, "modal"));
};

export const closeCreateGrantorAssetModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_GRANTOR_ASSET_MODAL });
};