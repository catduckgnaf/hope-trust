import {
  GET_AGENTS,
  IS_FETCHING_AGENTS,
  HAS_REQUESTED_AGENTS
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";

export const getAgents = (override = false) => async (dispatch) => {
  if ((!store.getState().agents.isFetching && !store.getState().agents.requested) || override) {
    dispatch({ type: IS_FETCHING_AGENTS, payload: true });
    try {
      const data = await API.post(
      apiGateway.NAME,
      `/agents/get-agents/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        body: {
          type: store.getState().user.benefits_data.type,
          parent_id: store.getState().user.benefits_data.parent_id,
          config_id: store.getState().user.benefits_data.config_id,
          group_ids: store.getState().user.benefits_data.type === "group" ? [store.getState().user.benefits_data.id] : store.getState().groups.list.map((g) => g.id),
          retailer_ids: store.getState().retail.list.map((r) => r.id)
        }
      });
      if (data.success) {
        dispatch({ type: GET_AGENTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_AGENTS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_AGENTS, payload: true });
        dispatch({ type: IS_FETCHING_AGENTS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_AGENTS, payload: [] });
      dispatch({ type: HAS_REQUESTED_AGENTS, payload: true });
      dispatch({ type: IS_FETCHING_AGENTS, payload: false });
      return { success: false };
    }
  }
};
export const getPublicAgents = (override = false) => async (dispatch) => {
  if ((!store.getState().agents.isFetching && !store.getState().agents.requested) || override) {
    dispatch({ type: IS_FETCHING_AGENTS, payload: true });
    try {
      const data = await API.get(
      apiGateway.NAME,
      "/agents/get-public-agents",
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_AGENTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_AGENTS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_AGENTS, payload: true });
        dispatch({ type: IS_FETCHING_AGENTS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_AGENTS, payload: [] });
      dispatch({ type: HAS_REQUESTED_AGENTS, payload: true });
      dispatch({ type: IS_FETCHING_AGENTS, payload: false });
      return { success: false };
    }
  }
};
export const createAgent = (newAgent) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/agents/create-single-agent/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newAgent
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

export const updateAgent = (ID, updatedAgent) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/agents/update-single-agent/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedAgent
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