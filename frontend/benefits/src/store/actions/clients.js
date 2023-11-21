import {
  GET_CLIENTS,
  ADD_CLIENT,
  DELETE_CLIENT,
  EDIT_CLIENT,
  IS_FETCHING_CLIENTS,
  HAS_REQUESTED_CLIENTS,
  OPEN_CLIENT_MODAL,
  CLOSE_CLIENT_MODAL
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import { showNotification } from "./notification";

export const getClients = (override = false) => async (dispatch) => {
  if ((!store.getState().clients.isFetching && !store.getState().clients.requested) || override) {
    const root = store.getState();
    let config_ids = root.groups.list.map((g) => g.config_id);
    if (store.getState().user.benefits_data.type === "group") config_ids.push(store.getState().user.benefits_data.config_id);
    dispatch({ type: IS_FETCHING_CLIENTS, payload: true });
    try {
      const data = await API.post(
      apiGateway.NAME,
        `/clients/get-clients/${store.getState().session.account_id}/${store.getState().user.benefits_data.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        body: {
          config_ids,
          type: store.getState().user.benefits_data.type,
          parent_id: store.getState().user.benefits_data.parent_id
        }
      });
      if (data.success) {
        dispatch({ type: GET_CLIENTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_CLIENTS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_CLIENTS, payload: true });
        dispatch({ type: IS_FETCHING_CLIENTS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_CLIENTS, payload: [] });
      dispatch({ type: HAS_REQUESTED_CLIENTS, payload: true });
      dispatch({ type: IS_FETCHING_CLIENTS, payload: false });
      return { success: false };
    }
  }
};

export const createClient = (newClient) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/clients/create-single-client/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newClient
      }
    }).then((data) => {
      dispatch({ type: ADD_CLIENT, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateClient = (ID, updatedClient) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/clients/update-single-client/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedClient
      }
    }).then((data) => {
      dispatch({ type: EDIT_CLIENT, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};
export const deleteClient = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_CLIENT, payload: ID });
  return API.del(
    apiGateway.NAME,
    `/clients/delete-single-client/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
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

export const sendClientInvite = (client_info, invite_info, group, params) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/clients/send-client-invitation/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        type: store.getState().user.benefits_data.type,
        client_info,
        invite_info,
        group,
        params
      }
    }).then((data) => {
      if (data.success) dispatch(showNotification("success", "Client Invitation", `Invitation successfully sent to ${client_info.beneficiaryFirst} ${client_info.beneficiaryLast}`));
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const openCreateRetailModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CLIENT_MODAL, payload: { defaults, updating, viewing, current_page }});
  dispatch(logEvent("client", store.getState().user, "modal"));
};

export const closeCreateRetailModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CLIENT_MODAL });
};