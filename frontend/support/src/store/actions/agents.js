import {
  GET_AGENTS,
  ADD_AGENT,
  DELETE_AGENT,
  EDIT_AGENT,
  IS_FETCHING_AGENTS,
  HAS_REQUESTED_AGENTS,
  OPEN_AGENT_MODAL,
  CLOSE_AGENT_MODAL
} from "../actions/constants";
import { getGroups } from "./groups";
import { getTeams } from "./teams";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { customerServiceGetPendingApprovals } from "./customer-support";

const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getAgents = (override = false) => async (dispatch) => {
  if ((!store.getState().agents.isFetching && !store.getState().agents.requested) || override) {
    dispatch({ type: IS_FETCHING_AGENTS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/agents/get-agents/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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
    Gateway.name,
    `/agents/create-single-agent/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newAgent
      }
    }).then((data) => {
      dispatch({ type: ADD_AGENT, payload: data.payload });
      dispatch(getGroups(true));
      dispatch(getTeams(true));
      dispatch(customerServiceGetPendingApprovals(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateAgent = (ID, update_data) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/agents/update-single-agent/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        update_data
      }
    }).then((data) => {
      dispatch({ type: EDIT_AGENT, payload: data.payload });
      if (update_data.new_cognito_id) dispatch(getGroups(true));
      if (update_data.new_cognito_id) dispatch(getTeams(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteAgent = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_AGENT, payload: ID });
  return API.del(
    Gateway.name,
    `/agents/delete-single-agent/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const openCreateAgentModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_AGENT_MODAL, payload: { defaults, updating, viewing, current_page }});
};

export const closeCreateAgentModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_AGENT_MODAL });
};