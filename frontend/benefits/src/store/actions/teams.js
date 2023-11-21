import {
  GET_TEAMS,
  IS_FETCHING_TEAMS,
  HAS_REQUESTED_TEAMS,
  SHOW_LOADER,
  HIDE_LOADER,
  OPEN_TEAM_MODAL,
  CLOSE_TEAM_MODAL
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import { createUserRecord } from "./customer-support";
import { showNotification } from "./notification";

export const getTeams = (override = false) => async (dispatch) => {
  if ((!store.getState().teams.isFetching && !store.getState().teams.requested) || override) {
    dispatch({ type: IS_FETCHING_TEAMS, payload: true });
    try {
      const data = await API.post(
      apiGateway.NAME,
      `/teams/get-teams/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        body: {
          type: store.getState().user.benefits_data.type,
          config_id: store.getState().user.benefits_data.config_id,
          group_ids: store.getState().user.benefits_data.type === "group" ? [store.getState().user.benefits_data.id] : store.getState().groups.list.map((g) => g.id),
          parent_id: store.getState().user.benefits_data.parent_id
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
export const getPublicTeams = (override = false) => async (dispatch) => {
  if ((!store.getState().teams.isFetching && !store.getState().teams.requested) || override) {
    dispatch({ type: IS_FETCHING_TEAMS, payload: true });
    try {
      const data = await API.get(
      apiGateway.NAME,
      "/teams/get-public-teams",
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
export const createTeam = (newTeam, addition) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/teams/create-single-team/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newTeam,
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

export const createTeamRecord = (account, newAccount, temp) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/teams/create-new-team/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        account,
        newAccount,
        temp
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

export const updateTeam = (ID, updatedTeam) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/teams/update-single-team/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedTeam
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

export const createNewTeam = (account) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating user..." } });
  return dispatch(createUserRecord(account.user, false, true, false, "benefits"))
    .then(async (newUser) => {
      if ((newUser && newUser.success)) {
        const createdUser = newUser.payload;
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating account..." } });
        const newAccount = await API.post(
          apiGateway.NAME,
          `/accounts/create/${store.getState().user.cognito_id}`,
          {
            headers: {
              Authorization: store.getState().session.token
            },
            body: {
              "account_name": account.team.name || `${account.user.first_name} ${account.user.last_name}`,
              "beneficiary_id": createdUser.cognito_id,
              "cognito_id": createdUser.cognito_id,
              "user_type": "team",
              "parent_id": store.getState().user.cognito_id,
              "status": "pending"
            }
          });
        if (newAccount.success) {
          dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating team..." } });
          return dispatch(createTeamRecord(account, newAccount.payload, createdUser.temp))
            .then((team) => {
              if (team.success) {
                dispatch(getTeams(true));
                dispatch(showNotification("success", "Team Created", `A new team has been created. A temporary password has been sent to ${account.user.first_name} at ${account.user.email}.`));
              }
              dispatch({ type: HIDE_LOADER });
              return team;
            })
            .catch((error) => {
              dispatch(showNotification("success", "Team Creation Failed", "Could not create new group."));
              dispatch({ type: HIDE_LOADER });
              if (error && error.response) return error.response.data;
              return { success: false };
            });
        }
      }
    })
    .catch((user_error) => {
      dispatch({ type: HIDE_LOADER });
      if (user_error && user_error.response) return user_error.response.data;
      return { success: false };
    });
};

export const openCreateTeamModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_TEAM_MODAL, payload: { defaults, updating, viewing }});
  dispatch(logEvent("team", store.getState().user, "modal"));
};

export const closeCreateTeamModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_TEAM_MODAL });
};