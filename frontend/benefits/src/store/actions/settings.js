import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { IS_LOGGED_IN, CHANGE_SETTINGS_TAB } from "./constants";
import { store } from "..";

export const all_permissions_array = [
  "account-admin-view",
  "account-admin-edit"
];

export const changeSettingsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_SETTINGS_TAB, payload: tab });
};

export const addPermissions = (updates) => async (dispatch) => {
  const added = await API.post(
    apiGateway.NAME,
    `/permissions/add/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        added: updates
      }
    });
  if (added && added.success) {
    dispatch({ type: IS_LOGGED_IN, payload: added.payload });
  }
};

export const removePermissions = (updates) => async (dispatch) => {
  const removed = await API.post(
    apiGateway.NAME,
    `/permissions/remove/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        removed: updates
      }
    });
  if (removed && removed.success) {
    dispatch({ type: IS_LOGGED_IN, payload: removed.payload });
  }
};