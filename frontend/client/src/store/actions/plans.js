import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import {
  GET_ACTIVE_USER_PLANS,
  GET_ACTIVE_PARTNER_PLANS,
  IS_FETCHING_ACTIVE_USER_PLANS,
  IS_FETCHING_ACTIVE_PARTNER_PLANS,
  HAS_REQUESTED_ACTIVE_USER_PLANS,
  HAS_REQUESTED_ACTIVE_PARTNER_PLANS
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const all_permissions_array = [
  "account-admin-view",
  "account-admin-edit",
  "finance-view",
  "finance-edit",
  "health-and-life-view",
  "ealth-and-life-edit",
  "grantor-assets-view",
  "grantor-assets-edit",
  "budget-view",
  "budget-edit",
  "myto-view",
  "myto-edit",
  "request-hcc-view",
  "request-hcc-edit"
];

export const getActiveUserPlans = (override = false, get_all = false) => async (dispatch) => {
  if ((!store.getState().plans.isFetchingActiveUserPlans && !store.getState().plans.requestedActiveUserPlans) || override) {
    dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/plans/get-active-user-plans/${(store.getState().session.account_id || store.getState().user.cognito_id)}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          },
          queryStringParameters: {
            get_all
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACTIVE_USER_PLANS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_ACTIVE_USER_PLANS, payload: true });
        dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_ACTIVE_USER_PLANS, payload: true });
      dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: false });
    }
  }
};

export const getActivePartnerPlans = (type, name, account_id, override = false) => async (dispatch) => {
  if ((!store.getState().plans.isFetchingActivePartnerPlans && !store.getState().plans.requestedActivePartnerPlans) || override) {
    dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        "/plans/get-active-partner-plans",
        {
          headers: {
            Authorization: store.getState().session.token
          },
          queryStringParameters: {
            type: type || store.getState().user.partner_data.partner_type,
            name: name || store.getState().user.partner_data.name,
            account_id: account_id || store.getState().user.cognito_id
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACTIVE_PARTNER_PLANS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_ACTIVE_PARTNER_PLANS, payload: true });
        dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_ACTIVE_PARTNER_PLANS, payload: true });
      dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: false });
    }
  }
};