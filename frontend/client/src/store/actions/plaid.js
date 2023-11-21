import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import {
  CREATE_GRANTOR_ASSET_RECORDS,
  CREATE_BENEFICIARY_ASSET_RECORDS,
  OPEN_PLAID_LINK_MODAL,
  CLOSE_PLAID_LINK_MODAL
} from "./constants";
import { getGrantorAssets } from "./grantor-assets";
import { getBeneficiaryAssets } from "./beneficiary-assets";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getPlaidAccounts = (token, metadata) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/plaid/get-plaid-accounts/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        token,
        metadata
      }
    }).then((data) => {
      if (data.success) {
        if (data.payload.grantor) {
          dispatch({ type: CREATE_GRANTOR_ASSET_RECORDS, payload: { data: data.payload.grantor } });
          dispatch(getGrantorAssets(true));
        }
        if (data.payload.beneficiary) {
          dispatch({ type: CREATE_BENEFICIARY_ASSET_RECORDS, payload: { data: data.payload.beneficiary } });
          dispatch(getBeneficiaryAssets(true));
        }
        return { success: true };
      }
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const getPlaidLinkToken = async (user, webhook, access_token) => {
  return API.post(
    Gateway.name,
    `/plaid/get-link-token/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        user,
        webhook,
        access_token
      }
    }).then((data) => {
      return data.payload;
    }).catch((error) => {
      return false;
    });
};

export const openPlaidLinkModal = (token, metadata) => async (dispatch) => {
  dispatch({ type: OPEN_PLAID_LINK_MODAL, payload: { token, metadata } });
  dispatch(logEvent("plaid-link", store.getState().user, "modal"));
};

export const closePlaidLinkModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_PLAID_LINK_MODAL });
};