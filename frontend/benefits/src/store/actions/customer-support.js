import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import {
  IS_FETCHING_CORE_SETTINGS,
  HAS_REQUESTED_CORE_SETTINGS,
  GET_CORE_SETTINGS
} from "./constants";
import { store } from "..";


export const getCoreSettings = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingCoreSettings && !store.getState().customer_support.requestedCoreSettings) || override) {
    dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: true });
    try {
      const data = await API.get(apiGateway.NAME, "/accounts/get-core-settings");
      if (data.success) {
        dispatch({ type: GET_CORE_SETTINGS, payload: data.payload });
        dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: false });
        if (data.payload.benefits_debug) window.LOG_LEVEL = "DEBUG";
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_CORE_SETTINGS, payload: true });
        dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_CORE_SETTINGS, payload: true });
      dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: false });
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    }
  }
};

export const createBenefitsClient = (account, group, rep, agent, params) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/clients/create-benefits-client/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        account,
        group,
        rep,
        agent,
        params
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      dispatch(showNotification("error", "Benefits Error", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const createMembership = (account_id, cognito_id, data) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/membership/create-new-membership/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        target_account_id: account_id,
        cognito_id,
        data
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const createUserRecord = (user, create_stripe_customer, create_hubspot_contact, associated_account, pool_type) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/clients/create-new-user/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        user,
        create_stripe_customer,
        create_hubspot_contact,
        associated_account,
        pool_type
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const updateUserRecord = (cognito_id, updates, type, balance) => async (dispatch) => {
  return API.patch(
    apiGateway.NAME,
    `/clients/update-user-record/${store.getState().session.account_id}/${store.getState().user.cognito_id}/${cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        balance,
        updates,
        type
      }
    }).then((updatedUser) => {
      if (updatedUser.success) dispatch(showNotification("success", "User Updated", `${updatedUser.payload.first_name} was successfully updated.`));
      return updatedUser;
    }).catch((error) => {
      dispatch(showNotification("error", "User Update", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};