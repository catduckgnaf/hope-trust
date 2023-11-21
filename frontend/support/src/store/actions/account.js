import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { showNotification } from "./notification";
import {
  CHANGE_ACCOUNTS_TAB,
  OPEN_ACCOUNT_UPDATE_MODAL,
  CLOSE_ACCOUNT_UPDATE_MODAL,
  UPDATE_ACCOUNT_RECORD,
  UPDATE_PARTNER_ACCOUNT_RECORD,
  OPEN_CREATE_ACCOUNT_MODAL,
  CLOSE_CREATE_ACCOUNT_MODAL,
  CLEAR_SIGNUP_STATE,
  IS_FETCHING_GROUP_APPROVALS,
  GET_GROUP_APPROVALS,
  HAS_REQUESTED_GROUP_APPROVALS,
  IS_FETCHING_PRODUCTS,
  GET_PRODUCTS,
  IS_FETCHING_WHOLESALE_APPROVALS,
  GET_WHOLESALE_APPROVALS,
  HAS_REQUESTED_WHOLESALE_APPROVALS,
  HAS_REQUESTED_PRODUCTS
} from "./constants";
import { customerServiceGetAllAccounts, customerServiceGetAllBenefitsConfigs, customerServiceGetAllPartners, customerServiceGetAllUsers, getAllTransactions } from "./customer-support";
import { getGroups } from "./groups";
import { getAgents } from "./agents";
import { getTeams } from "./teams";

const Gateway = apiGateway.find((gateway) => gateway.name === "accounts");

export const updateCoreAccount = (updates, target_account_id, type) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update-single-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates,
        target_account_id
      }
    })
    .then((updated) => {
      if (type === "user") dispatch({ type: UPDATE_ACCOUNT_RECORD, payload: { updates: updated.payload, account_id: target_account_id } });
      if (type === "partner") dispatch({ type: UPDATE_PARTNER_ACCOUNT_RECORD, payload: { updates: updated.payload, account_id: target_account_id } });
      return { success: true };
    })
    .catch((error) => {
      if (error && error.response) dispatch(showNotification("error", "Subscription Transfer", error.response.data.message));
      return { success: false };
    });
};

export const updateSubscriptionRecord = (account_id, subscription_id, updates, type) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update-subscription-record/${subscription_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    })
    .then((updated) => {
      if (type === "user") dispatch({ type: UPDATE_ACCOUNT_RECORD, payload: { updates: updated.payload, account_id } });
      if (type === "partner") dispatch({ type: UPDATE_PARTNER_ACCOUNT_RECORD, payload: { updates: updated.payload, account_id } });
      return updated.success;
    })
    .catch((error) => {
      if (error && error.response) dispatch(showNotification("error", "Subscription Updated", error.response.data.message));
      return { success: false };
    });
};

export const getAccountFeatures = (account_id) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/get-account-features/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      queryStringParameters: {
        lookup_id: account_id
      }
    })
    .then((features) => {
      return features.payload;
    })
    .catch((error) => {
      return { success: false };
    });
};

export const updatePartnerAccount = (account_id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update-partner-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates,
        cognito_id: account_id
      }
    }).then((data) => {
      dispatch({ type: UPDATE_PARTNER_ACCOUNT_RECORD, payload: { updates: data.payload, account_id } });
      return data;
    }).catch((error) => {
      dispatch(showNotification("error", "Partner account could not be updated.", "There was a problem updating your partner account."));
      return {
        success: false,
        error
      };
    });
};

export const updateAccountFeatures = (account_id, updates, type) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update-account-features/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        lookup_id: account_id,
        updates,
        type
      }
    })
    .then((features) => {
      dispatch(showNotification("success", "Account Features", "Successfully updated account features."));
      if (type === "user") dispatch({ type: UPDATE_ACCOUNT_RECORD, payload: { updates: features.payload, account_id } });
      if (type === "partner") dispatch({ type: UPDATE_PARTNER_ACCOUNT_RECORD, payload: { updates: features.payload, account_id } });
      return features.payload;
    })
    .catch((error) => {
      dispatch(showNotification("error", "Account Features", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const createAccount = (user) => async (dispatch) => {
  return await API.post(
    Gateway.name,
    `/create/${user.cognito_id}`, {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "account_name": `${user.first_name} ${user.last_name}`,
        "beneficiary_id": user.cognito_id,
        "cognito_id": user.cognito_id,
        "account_id": user.cognito_id,
        "status": "active",
        "user_type": "customer-support"
      }
    }
  );
};

export const createClientAccount = (fields, account_info, transaction, created, createdUser) => async (dispatch) => {
  return await API.post(
    Gateway.name,
    `/create-client-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "account_name": `${account_info.first_name} ${account_info.middle_name ? `${account_info.middle_name} ` : ""}${account_info.last_name}`,
        "cognito_id": account_info.cognito_id,
        "target_account_id": account_info.creator_id,
        "plan_id": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan.price_id : null,
        "subscription_id": (transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.id : null,
        "hubspot_deal_id": fields.hubspot_deal_id,
        "permissions": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan.permissions : ["basic-user"],
        "sendEmail": (created.notifyBeneficiary ? 1 : 0),
        "noEmail": (created.noBeneficiaryEmail ? 1 : 0),
        createdUser
      }
    }
  );
};

export const getGroupApprovals = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.requestedGroupApprovals && !store.getState().customer_support.isFetchingGroupApprovals) || override) {
    dispatch({ type: IS_FETCHING_GROUP_APPROVALS, payload: true });
    return API.get(
      Gateway.name,
      `/get-group-approvals/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          "Authorization": store.getState().session.token
        }
      })
      .then((data) => {
        dispatch({ type: GET_GROUP_APPROVALS, payload: data.payload });
        dispatch({ type: IS_FETCHING_GROUP_APPROVALS, payload: false });
        return data.payload;
      })
      .catch((error) => {
        dispatch({ type: GET_GROUP_APPROVALS, payload: [] });
        dispatch({ type: HAS_REQUESTED_GROUP_APPROVALS, payload: true });
        dispatch({ type: IS_FETCHING_GROUP_APPROVALS, payload: false });
        return {
          success: false,
          error
        };
      });
  }
};

export const getAllProducts = (override = false) => async (dispatch) => {
  if (((!store.getState().account.isFetchingProducts && !store.getState().account.requestedProducts) || override)) {
    dispatch({ type: IS_FETCHING_PRODUCTS, payload: true });
    return API.get(
      Gateway.name,
      `/get-all-products/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      })
      .then((data) => {
        dispatch({ type: GET_PRODUCTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_PRODUCTS, payload: false });
        return data;
      })
      .catch((error) => {
        dispatch({ type: HAS_REQUESTED_PRODUCTS, payload: true });
        dispatch({ type: IS_FETCHING_PRODUCTS, payload: false });
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      });
  }
};

export const createBenefitsClient = (account, group, rep, agent, params) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/create-benefits-client/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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
      dispatch(showNotification("success", "Benefits Client", data.message));
      dispatch(customerServiceGetAllUsers(true));
      dispatch(customerServiceGetAllAccounts(true));
      dispatch(customerServiceGetAllBenefitsConfigs(true));
      dispatch(customerServiceGetAllPartners(true));
      dispatch(getAllTransactions(true));
      dispatch(getGroups(true));
      dispatch(getAgents(true));
      dispatch(getTeams(true));
      return { success: true };
    }).catch((error) => {
      dispatch(showNotification("error", "Benefits Error", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const getWholesaleApprovals = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.requestedWholesaleApprovals && !store.getState().customer_support.isFetchingWholesaleApprovals) || override) {
    dispatch({ type: IS_FETCHING_WHOLESALE_APPROVALS, payload: true });
    return API.get(
      Gateway.name,
      `/get-wholesale-approvals/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          "Authorization": store.getState().session.token
        }
      })
      .then((data) => {
        dispatch({ type: GET_WHOLESALE_APPROVALS, payload: data.payload });
        dispatch({ type: IS_FETCHING_WHOLESALE_APPROVALS, payload: false });
        return data.payload;
      })
      .catch((error) => {
        dispatch({ type: GET_WHOLESALE_APPROVALS, payload: [] });
        dispatch({ type: HAS_REQUESTED_WHOLESALE_APPROVALS, payload: true });
        dispatch({ type: IS_FETCHING_WHOLESALE_APPROVALS, payload: false });
        return {
          success: false,
          error
        };
      });
  }
};

export const openCreateAccountModal = (config) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_ACCOUNT_MODAL, payload: config });
};

export const closeCreateAccountModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_ACCOUNT_MODAL });
  dispatch({ type: CLEAR_SIGNUP_STATE });
};

export const openAccountUpdateModal = (defaults, type, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_ACCOUNT_UPDATE_MODAL, payload: { defaults, type, current_page } });
};

export const closeAccountUpdateModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_ACCOUNT_UPDATE_MODAL });
};

export const changeAccountsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_ACCOUNTS_TAB, payload: tab });
};