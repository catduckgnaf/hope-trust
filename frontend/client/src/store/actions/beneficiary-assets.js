import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import {
  GET_ACCOUNT_BENEFICIARY_ASSETS,
  CREATE_BENEFICIARY_ASSET_RECORD,
  UPDATE_BENEFICIARY_ASSET_RECORD,
  DELETE_BENEFICIARY_ASSET_RECORD,
  OPEN_CREATE_BENEFICIARY_ASSET_MODAL,
  CLOSE_CREATE_BENEFICIARY_ASSET_MODAL,
  IS_FETCHING_BENEFICIARY_ASSETS,
  HAS_REQUESTED_BENEFICIARY_ASSETS
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getBeneficiaryAssets = (override) => async (dispatch) => {
  if ((!store.getState().beneficiary_assets.isFetching && !store.getState().beneficiary_assets.requested) || override) {
    dispatch({ type: IS_FETCHING_BENEFICIARY_ASSETS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/finance/get-beneficiary-assets/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACCOUNT_BENEFICIARY_ASSETS, payload: { data: data.payload } });
        dispatch({ type: IS_FETCHING_BENEFICIARY_ASSETS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_BENEFICIARY_ASSETS, payload: true });
        dispatch({ type: IS_FETCHING_BENEFICIARY_ASSETS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_BENEFICIARY_ASSETS, payload: true });
      dispatch({ type: IS_FETCHING_BENEFICIARY_ASSETS, payload: false });
    }
  }
};

export const createBeneficiaryAssetRecord = (type, newFinance) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/finance/create-single-beneficiary-asset/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newFinance
      }
    }).then((data) => {
      dispatch({ type: CREATE_BENEFICIARY_ASSET_RECORD, payload: { type, data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateBeneficiaryAssetRecord = (ID, newFinance) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/finance/update-single-beneficiary-asset/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "updates": newFinance
      },
      queryStringParameters: {
        type: "assets"
      }
    }).then((data) => {
      dispatch({ type: UPDATE_BENEFICIARY_ASSET_RECORD, payload: { ID, data: data.payload } });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteBeneficiaryAssetRecord = (ID, plaid_item_id) => async (dispatch) => {
  dispatch({ type: DELETE_BENEFICIARY_ASSET_RECORD, payload: ID });
  return API.patch(
    Gateway.name,
    `/finance/delete-single-beneficiary-asset/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const openCreateBeneficiaryAssetModal = (type, finance_type, source, defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_BENEFICIARY_ASSET_MODAL, payload: { type, finance_type, source, defaults, updating, viewing } });
  dispatch(logEvent("beneficiary-asset", store.getState().user, "modal"));
};

export const closeCreateBeneficiaryAssetModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_BENEFICIARY_ASSET_MODAL });
};