import { API } from "aws-amplify";
import { apiGateway } from "../../config";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const searchReferrals = (param = false, value = false, domain = false) => async (dispatch) => {
  return API.get(Gateway.name, `/referrals/search-referrals?param=${param}&value=${value}&domain=${domain}`).then((data) => {
      return data;
  }).catch((error) => {
    return {
      success: false,
      error
    };
  });
};

export const checkReferralDomain = (domain) => async (dispatch) => {
  return API.get(Gateway.name, `/referrals/check-domain?domain=${domain}`).then((data) => {
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};