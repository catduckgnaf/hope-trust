import {
  GET_WHOLESALERS,
  IS_FETCHING_WHOLESALERS,
  HAS_REQUESTED_WHOLESALERS,
  GET_WHOLESALE_APPROVALS,
  IS_FETCHING_WHOLESALE_APPROVALS,
  HAS_REQUESTED_WHOLESALE_APPROVALS
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { getRetailers } from "./retail";
import { getAgents } from "./agents";
import { getTeams } from "./teams";

export const getWholesalers = (override = false) => async (dispatch) => {
  if ((!store.getState().wholesale.isFetching && !store.getState().wholesale.requested) || override) {
    dispatch({ type: IS_FETCHING_WHOLESALERS, payload: true });
    try {
      const data = await API.post(
      apiGateway.NAME,
      `/wholesale/get-wholesalers/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        body: {
          group_ids: store.getState().groups.list.map((g) => g.config_id),
          retailer_id: store.getState().user.benefits_data.parent_id,
          type: store.getState().user.benefits_data.type
        }
      });
      if (data.success) {
        dispatch({ type: GET_WHOLESALERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_WHOLESALERS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_WHOLESALERS, payload: true });
        dispatch({ type: IS_FETCHING_WHOLESALERS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_WHOLESALERS, payload: [] });
      dispatch({ type: HAS_REQUESTED_WHOLESALERS, payload: true });
      dispatch({ type: IS_FETCHING_WHOLESALERS, payload: false });
      return { success: false };
    }
  }
};
export const getPublicWholesalers = (override = false) => async (dispatch) => {
  if ((!store.getState().wholesale.isFetching && !store.getState().wholesale.requested) || override) {
    dispatch({ type: IS_FETCHING_WHOLESALERS, payload: true });
    try {
      const data = await API.get(
      apiGateway.NAME,
      "/wholesale/get-public-wholesalers",
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_WHOLESALERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_WHOLESALERS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_WHOLESALERS, payload: true });
        dispatch({ type: IS_FETCHING_WHOLESALERS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_WHOLESALERS, payload: [] });
      dispatch({ type: HAS_REQUESTED_WHOLESALERS, payload: true });
      dispatch({ type: IS_FETCHING_WHOLESALERS, payload: false });
      return { success: false };
    }
  }
};
export const createWholesaler = (newWholesaler, addition) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/wholesale/create-single-wholesaler/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newWholesaler,
        addition
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateWholesaler = (ID, updatedWholesaler) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/wholesale/update-single-wholesaler/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedWholesaler
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const getWholesaleApprovals = (override) => async (dispatch) => {
  if ((!store.getState().wholesale.requestedWholesaleApprovals && !store.getState().wholesale.isFetchingWholesaleApprovals) || override) {
    dispatch({ type: IS_FETCHING_WHOLESALE_APPROVALS, payload: true });
    try {
      const data = await API.get(
        apiGateway.NAME,
        `/wholesale/get-wholesale-approvals/${store.getState().user.benefits_data.config_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_WHOLESALE_APPROVALS, payload: data.payload });
        dispatch({ type: IS_FETCHING_WHOLESALE_APPROVALS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_WHOLESALE_APPROVALS, payload: true });
        dispatch({ type: IS_FETCHING_WHOLESALE_APPROVALS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: GET_WHOLESALE_APPROVALS, payload: [] });
      dispatch({ type: HAS_REQUESTED_WHOLESALE_APPROVALS, payload: true });
      dispatch({ type: IS_FETCHING_WHOLESALE_APPROVALS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const approveWholesaleRequest = (config_id, cognito_id, request_id) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/wholesale/approve-wholesale-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        config_id,
        cognito_id
      }
    }).then((data) => {
      if (data.success) {
        dispatch(getWholesaleApprovals(true));
        dispatch(getRetailers(true));
        dispatch(getTeams(true));
        dispatch(getAgents(true));
      }
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const declineWholesaleRequest = (config_id, cognito_id, request_id) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/wholesale/decline-wholesale-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        config_id,
        cognito_id
      }
    }).then((data) => {
      if (data.success) dispatch(getWholesaleApprovals(true));
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};