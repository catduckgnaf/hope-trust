import { API } from "aws-amplify";
import { UPDATE_DOWNLOAD_LINK } from "../actions/constants";
import { apiGateway } from "../../config";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getHelloSignDownloadLink = (request_id) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/hello-sign/get-download-link/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        request_id
      }
    }).then(async (data) => {
      if (data.success) {
        dispatch({ type: UPDATE_DOWNLOAD_LINK, payload: data.payload });
        return { success: true };
      } else {
        return { success: false };
      }
    }).catch((error) => {
      return { success: false };
    });
};