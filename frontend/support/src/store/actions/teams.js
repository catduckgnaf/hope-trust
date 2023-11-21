import {
  GET_TEAMS,
  ADD_TEAM,
  DELETE_TEAM,
  EDIT_TEAM,
  IS_FETCHING_TEAMS,
  HAS_REQUESTED_TEAMS,
  OPEN_TEAM_MODAL,
  CLOSE_TEAM_MODAL
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { getGroups } from "./groups";
import { customerServiceGetPendingApprovals } from "./customer-support";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getTeams = (override = false) => async (dispatch) => {
  if ((!store.getState().teams.isFetching && !store.getState().teams.requested) || override) {
    dispatch({ type: IS_FETCHING_TEAMS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/teams/get-teams/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_TEAMS, payload: data.payload });
        dispatch({ type: IS_FETCHING_TEAMS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_TEAMS, payload: true });
        dispatch({ type: IS_FETCHING_TEAMS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_TEAMS, payload: [] });
      dispatch({ type: HAS_REQUESTED_TEAMS, payload: true });
      dispatch({ type: IS_FETCHING_TEAMS, payload: false });
      return { success: false };
    }
  }
};
export const createTeam = (newTeam) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/teams/create-single-team/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newTeam
      }
    }).then((data) => {
      dispatch({ type: ADD_TEAM, payload: data.payload });
      dispatch(getGroups(true));
      dispatch(customerServiceGetPendingApprovals(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateTeam = (ID, update_data) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/teams/update-single-team/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        update_data
      }
    }).then((data) => {
      dispatch({ type: EDIT_TEAM, payload: data.payload });
      if (update_data.new_cognito_id) dispatch(getGroups(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteTeam = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_TEAM, payload: ID });
  return API.del(
    Gateway.name,
    `/teams/delete-single-team/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const openCreateTeamModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_TEAM_MODAL, payload: { defaults, updating, viewing, current_page }});
};

export const closeCreateTeamModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_TEAM_MODAL });
};