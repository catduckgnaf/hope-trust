import {
  GET_WHOLESALERS,
  ADD_WHOLESALER,
  DELETE_WHOLESALER,
  EDIT_WHOLESALER,
  IS_FETCHING_WHOLESALERS,
  HAS_REQUESTED_WHOLESALERS,
  OPEN_WHOLESALE_MODAL,
  CLOSE_WHOLESALE_MODAL,
  OPEN_WHOLESALE_CONNECTION_MODAL,
  CLOSE_WHOLESALE_CONNECTION_MODAL
} from "../actions/constants";
import { getWholesaleApprovals } from "./account";
import { getRetailers } from "./retail";
import { getTeams } from "./teams";
import { getAgents } from "./agents";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getWholesalers = (override = false) => async (dispatch) => {
  if ((!store.getState().wholesale.isFetching && !store.getState().wholesale.requested) || override) {
    dispatch({ type: IS_FETCHING_WHOLESALERS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/wholesale/get-wholesalers/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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
export const createWholesaler = (newWholesaler) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/wholesale/create-single-wholesaler/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newWholesaler
      }
    }).then((data) => {
      dispatch({ type: ADD_WHOLESALER, payload: data.payload });
      dispatch(getRetailers(true));
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateWholesaler = (ID, updatedWholesaler, old_cognito_id, new_cognito_id, config_id) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/wholesale/update-single-wholesaler/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedWholesaler,
        old_cognito_id,
        new_cognito_id,
        config_id
      }
    }).then((data) => {
      dispatch({ type: EDIT_WHOLESALER, payload: data.payload });
      if (new_cognito_id) dispatch(getRetailers(true));
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteWholesaler = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_WHOLESALER, payload: ID });
  return API.del(
    Gateway.name,
    `/wholesale/delete-single-wholesaler/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const approveWholesaleRequest = (config_id, cognito_id, request_id) => async (dispatch) => {
  return API.patch(
    Gateway.name,
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
    Gateway.name,
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

export const createWholesaleConnection = (updates) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/wholesale/create-wholesale-request/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) {
        dispatch({ type: CLOSE_WHOLESALE_CONNECTION_MODAL });
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

export const updateWholesaleConnection = (request_id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/wholesale/update-wholesale-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) {
        dispatch({ type: CLOSE_WHOLESALE_CONNECTION_MODAL });
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

export const deleteWholesaleConnection = (request_id) => async (dispatch) => {
  return API.del(
    Gateway.name,
    `/wholesale/delete-wholesale-request/${request_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      if (data.success) {
        dispatch({ type: CLOSE_WHOLESALE_CONNECTION_MODAL });
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

export const openCreateWholesaleConnectionModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_WHOLESALE_CONNECTION_MODAL, payload: { defaults, updating, viewing, current_page } });
};

export const closeCreateWholesaleConnectionModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_WHOLESALE_CONNECTION_MODAL });
};

export const openCreateWholesaleModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_WHOLESALE_MODAL, payload: { defaults, updating, viewing, current_page }});
};

export const closeCreateWholesaleModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_WHOLESALE_MODAL });
};