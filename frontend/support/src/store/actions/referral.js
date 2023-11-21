import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { showNotification } from "./notification";
import { IS_FETCHING_REFERRALS, HAS_REQUESTED_REFERRALS, GET_REFERRALS, CREATE_REFERRAL, UPDATE_REFERRAL, DELETE_REFERRAL, DELETE_REFERRALS, OPEN_CREATE_REFERRAL_MODAL, CLOSE_CREATE_REFERRAL_MODAL } from "../actions/constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getReferrals = (override = false) => async (dispatch) => {
  if ((!store.getState().referral.isFetching && !store.getState().referral.requested) || override) {
    dispatch({ type: IS_FETCHING_REFERRALS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/referrals/get-referrals/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_REFERRALS, payload: data.payload });
        dispatch({ type: IS_FETCHING_REFERRALS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_REFERRALS, payload: true });
        dispatch({ type: IS_FETCHING_REFERRALS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_REFERRALS, payload: true });
      dispatch({ type: IS_FETCHING_REFERRALS, payload: false });
    }
  }
};


export const createReferral = (referral) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/referrals/create-referral/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "newReferral": referral
      }
    }).then((data) => {
      if (data.success) dispatch({ type: CREATE_REFERRAL, payload: data.payload });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false, message: "Something went wrong" };
    });
};

export const updateReferral = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/referrals/update-referral/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) dispatch({ type: UPDATE_REFERRAL, payload: data.payload });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteReferral = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_REFERRAL, payload: ID });
  return API.del(
    Gateway.name,
    `/referrals/delete-referral/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const deleteReferrals = (referral_ids) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/referrals/delete-referrals/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        referral_ids
      }
    }).then((data) => {
      if (data.payload.failed) dispatch(showNotification("error", "Delete Failed", `Could not delete ${data.payload.failed.length} of ${referral_ids.length} ${referral_ids.length === 1 ? "referral" : "referrals"}.`));
      else dispatch(showNotification("success", "Records Deleted", `Successfully deleted ${data.payload.success.length} of ${referral_ids.length} ${referral_ids.length === 1 ? "referral" : "referrals"}.`));
      dispatch({ type: DELETE_REFERRALS, payload: data.payload.success });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const openCreateReferralModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_REFERRAL_MODAL, payload: { defaults, updating, viewing, current_page } });
};
export const closeCreateReferralModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_REFERRAL_MODAL });
};

export const durations = [
  { value: "once", label: "Once" },
  { value: "repeating", label: "Repeating" },
  { value: "forever", label: "Forever" }
];