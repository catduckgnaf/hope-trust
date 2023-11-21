import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import {
  GET_ACTIVE_USER_PLANS,
  IS_FETCHING_ACTIVE_USER_PLANS,
  HAS_REQUESTED_ACTIVE_USER_PLANS
} from "./constants";

export const getActiveUserPlans = (override = false) => async (dispatch) => {
  if ((!store.getState().plans.isFetchingActiveUserPlans && !store.getState().plans.requestedActiveUserPlans) || override) {
    dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: true });
    try {
      const data = await API.get(
        apiGateway.NAME,
        `/plans/get-active-user-plans/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
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