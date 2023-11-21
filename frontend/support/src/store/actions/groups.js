import {
  GET_GROUPS,
  ADD_GROUP,
  DELETE_GROUP,
  EDIT_GROUP,
  IS_FETCHING_GROUPS,
  HAS_REQUESTED_GROUPS,
  OPEN_GROUP_MODAL,
  CLOSE_GROUP_MODAL,
  OPEN_GROUP_CONNECTION_MODAL,
  CLOSE_GROUP_CONNECTION_MODAL
} from "../actions/constants";
import { getTeams } from "./teams";
import { getAgents } from "./agents";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { getGroupApprovals } from "./account";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getGroups = (override = false) => async (dispatch) => {
  if ((!store.getState().groups.isFetching && !store.getState().groups.requested) || override) {
    dispatch({ type: IS_FETCHING_GROUPS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/groups/get-groups/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_GROUPS, payload: data.payload });
        dispatch({ type: IS_FETCHING_GROUPS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_GROUPS, payload: true });
        dispatch({ type: IS_FETCHING_GROUPS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_GROUPS, payload: [] });
      dispatch({ type: HAS_REQUESTED_GROUPS, payload: true });
      dispatch({ type: IS_FETCHING_GROUPS, payload: false });
      return { success: false };
    }
  }
};
export const createGroup = (newGroup, is_additional_account) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/groups/create-single-group/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newGroup,
        is_additional_account
      }
    }).then((data) => {
      dispatch({ type: ADD_GROUP, payload: data.payload });
      dispatch(getTeams(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateGroup = (ID, update_data) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/groups/update-single-group/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        update_data
      }
    }).then((data) => {
      dispatch({ type: EDIT_GROUP, payload: data.payload });
      if (update_data.new_cognito_id) dispatch(getTeams(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteGroup = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_GROUP, payload: ID });
  return API.del(
    Gateway.name,
    `/groups/delete-single-group/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const approveGroupRequest = (config_id, cognito_id, request_id) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/groups/approve-group-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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
        dispatch(getGroupApprovals(true));
        dispatch(getTeams(true));
        dispatch(getAgents(true));
      }
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const declineGroupRequest = (config_id, cognito_id, request_id) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/groups/decline-group-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        config_id,
        cognito_id
      }
    }).then((data) => {
      if (data.success) dispatch(getGroupApprovals(true));
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const createGroupConnection = (updates) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/groups/create-group-request/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) {
        dispatch(getGroupApprovals(true));
        dispatch(getTeams(true));
        dispatch(getAgents(true));
        dispatch({ type: CLOSE_GROUP_CONNECTION_MODAL });
      }
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateGroupConnection = (request_id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/groups/update-group-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) {
        dispatch(getGroupApprovals(true));
        dispatch(getTeams(true));
        dispatch(getAgents(true));
        dispatch({ type: CLOSE_GROUP_CONNECTION_MODAL });
      }
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const deleteGroupConnection = (request_id) => async (dispatch) => {
  return API.del(
    Gateway.name,
    `/groups/delete-group-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      if (data.success) {
        dispatch(getGroupApprovals(true));
        dispatch(getTeams(true));
        dispatch(getAgents(true));
        dispatch({ type: CLOSE_GROUP_CONNECTION_MODAL });
      }
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const openCreateGroupConnectionModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_GROUP_CONNECTION_MODAL, payload: { defaults, updating, viewing, current_page } });
};

export const closeCreateGroupConnectionModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_GROUP_CONNECTION_MODAL });
};

export const openCreateGroupModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_GROUP_MODAL, payload: { defaults, updating, viewing, current_page }});
};

export const closeCreateGroupModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_GROUP_MODAL });
};