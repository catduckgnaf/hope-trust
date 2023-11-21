import {
  GET_GROUPS,
  IS_FETCHING_GROUPS,
  HAS_REQUESTED_GROUPS,
  GET_GROUP_APPROVALS,
  IS_FETCHING_GROUP_APPROVALS,
  HAS_REQUESTED_GROUP_APPROVALS,
  OPEN_GROUP_MODAL,
  SHOW_LOADER,
  HIDE_LOADER,
  CLOSE_GROUP_MODAL
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { getAgents } from "./agents";
import { getTeams } from "./teams";
import { createUserRecord } from "./customer-support";
import { showNotification } from "./notification";

export const getGroups = (override = false) => async (dispatch) => {
  if ((!store.getState().groups.isFetching && !store.getState().groups.requested) || override) {
    dispatch({ type: IS_FETCHING_GROUPS, payload: true });
    try {
      const data = await API.post(
      apiGateway.NAME,
      `/groups/get-groups/${store.getState().session.account_id}/${store.getState().user.benefits_data.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        body: {
          type: store.getState().user.benefits_data.type,
          config_id: store.getState().user.benefits_data.config_id
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
export const getPublicGroups = (override = false) => async (dispatch) => {
  if ((!store.getState().groups.isFetching && !store.getState().groups.requested) || override) {
    dispatch({ type: IS_FETCHING_GROUPS, payload: true });
    try {
      const data = await API.get(
      apiGateway.NAME,
      "/groups/get-public-groups",
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
export const createGroup = (newGroup, addition) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/groups/create-single-group/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newGroup,
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
export const createGroupRecord = (account, newAccount, temp) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/groups/create-new-group/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const updateGroup = (ID, updatedGroup) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/groups/update-single-group/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedGroup
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

export const getGroupApprovals = (override) => async (dispatch) => {
  if ((!store.getState().groups.requestedGroupApprovals && !store.getState().groups.isFetchingGroupApprovals) || override) {
    dispatch({ type: IS_FETCHING_GROUP_APPROVALS, payload: true });
    try {
      const data = await API.get(
        apiGateway.NAME,
        `/groups/get-group-approvals/${store.getState().user.benefits_data.config_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_GROUP_APPROVALS, payload: data.payload });
        dispatch({ type: IS_FETCHING_GROUP_APPROVALS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_GROUP_APPROVALS, payload: true });
        dispatch({ type: IS_FETCHING_GROUP_APPROVALS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: GET_GROUP_APPROVALS, payload: [] });
      dispatch({ type: HAS_REQUESTED_GROUP_APPROVALS, payload: true });
      dispatch({ type: IS_FETCHING_GROUP_APPROVALS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const approveGroupRequest = (config_id, cognito_id, request_id) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
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
    apiGateway.NAME,
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

export const createNewGroup = (account) => async (dispatch) => {
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
              "account_name": account.group.name || `${account.user.first_name} ${account.user.last_name}`,
              "beneficiary_id": createdUser.cognito_id,
              "cognito_id": createdUser.cognito_id,
              "user_type": "group",
              "parent_id": store.getState().user.cognito_id,
              "status": "pending"
            }
          });
          if (newAccount.success) {
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating group..." } });
            return dispatch(createGroupRecord(account, newAccount.payload, createdUser.temp))
              .then((group) => {
                if (group.success) {
                  dispatch(getGroups(true));
                  dispatch(showNotification("success", "Group Created", `A new group has been created. A temporary password has been sent to ${account.user.first_name} at ${account.user.email}.`));
                }
                dispatch({ type: HIDE_LOADER });
                return group;
              })
              .catch((error) => {
                dispatch(showNotification("success", "Group Creation Failed", "Could not create new group."));
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

export const openCreateGroupModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_GROUP_MODAL, payload: { defaults, updating, viewing } });
};

export const closeCreateGroupModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_GROUP_MODAL });
};