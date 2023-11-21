import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { showNotification } from "./notification";
import { navigateTo } from "./navigation";
import authenticated from "../actions/authentication";
import { redirectAfterSwitch } from "../actions/utilities";
import { logEvent } from "./utilities";
import {
  SET_SESSION_ACCOUNT,
  IS_LOGGED_IN,
  SHOW_LOADER,
  OPEN_CREATE_ACCOUNT_MODAL,
  CLOSE_CREATE_ACCOUNT_MODAL,
  CREATE_NEW_RELATIONSHIP,
  OPEN_ADD_NEW_USER_MODAL,
  CLOSE_ADD_NEW_USER_MODAL,
  IS_SWITCHING,
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION,
  GET_ACCOUNT_SUBSCRIPTIONS,
  HAS_REQUESTED_CUSTOMER_SUBSCRIPTIONS,
  GET_ACCOUNT_TRANSACTIONS,
  HAS_REQUESTED_CUSTOMER_TRANSACTIONS,
  IS_FETCHING_TRANSACTIONS,
  IS_FETCHING_SUBSCRIPTIONS,
  CHANGE_ACCOUNTS_TAB,
  UPDATE_ACCOUNT_RECORD,
  UPDATE_PARTNER_ACCOUNT_RECORD,
  IS_FETCHING_RELATIONSHIPS,
  GET_RELATIONSHIPS,
  HAS_REQUESTED_RELATIONSHIPS,
  CLEAR_SIGNUP_STATE,
  IS_FETCHING_ACCOUNTS,
  GET_ACCOUNTS,
  HAS_REQUESTED_ACCOUNTS,
  UPDATE_CURRENT_ACCOUNT,
  CLEAR_ALL,
  HIDE_LOADER
} from "./constants";
import { getCurrentUser } from "./user";
import { deleteMembership } from "./membership";
import { toastr } from "react-redux-toastr";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const suggested_partner_permissions = {
  law: {
    permissions: [
      "finance-view",
      "finance-edit",
      "budget-view",
      "budget-edit",
      "myto-view",
      "myto-edit",
      "grantor-assets-view",
      "grantor-assets-edit"
    ]
  },
  bank_trust: {
    permissions: [
      "finance-view",
      "finance-edit",
      "budget-view",
      "budget-edit",
      "myto-view",
      "myto-edit",
      "grantor-assets-view",
      "grantor-assets-edit"
    ]
  },
  insurance: {
    permissions: [
      "finance-view",
      "finance-edit",
      "budget-view",
      "budget-edit",
      "myto-view",
      "myto-edit",
      "grantor-assets-view",
      "grantor-assets-edit"
    ]
  },
  ria: {
    permissions: [
      "finance-view",
      "finance-edit",
      "budget-view",
      "budget-edit",
      "myto-view",
      "myto-edit",
      "grantor-assets-view",
      "grantor-assets-edit"
    ]
  },
  healthcare: {
    permissions: [
      "health-and-life-view",
      "health-and-life-edit"
    ]
  },
  accountant: {
    permissions: [
      "finance-view",
      "finance-edit",
      "budget-view",
      "budget-edit",
      "myto-view",
      "myto-edit",
      "grantor-assets-view",
      "grantor-assets-edit"
    ]
  },
  advocate: {
    permissions: [
      "health-and-life-view",
      "health-and-life-edit"
    ]
  },
  education: {
    permissions: [
      "health-and-life-view",
      "health-and-life-edit"
    ]
  },
  other: {
    permissions: []
  },
};

export const getRelationships = (override = false, cognito_id, account_id) => async (dispatch) => {
  if ((!store.getState().relationship.isFetching && !store.getState().relationship.requested) || override) {
    dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/accounts/get-account-users/${(account_id || store.getState().session.account_id)}/${(cognito_id || store.getState().user.cognito_id)}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_RELATIONSHIPS, payload: data.payload });
        dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_RELATIONSHIPS, payload: true });
        dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_RELATIONSHIPS, payload: true });
      dispatch({ type: IS_FETCHING_RELATIONSHIPS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const getAccounts = (cognito_id, account_id, override, fetchRelationships = true) => async (dispatch) => {
  if ((!store.getState().account.isFetchingAccounts && !store.getState().account.requestedAccounts) || override) {
    dispatch({ type: IS_FETCHING_ACCOUNTS, payload: true });
    return API.get(Gateway.name, `/accounts/get-accounts/${(account_id || store.getState().session.account_id)}/${cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    })
      .then((data) => {
        const current = data.payload.find((a) => a.is_current);
        dispatch({ type: GET_ACCOUNTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ACCOUNTS, payload: false });
        if (current) dispatch({ type: UPDATE_CURRENT_ACCOUNT, payload: current });
        if (fetchRelationships) dispatch(getRelationships(true, cognito_id, account_id));
        return data.payload;
      })
      .catch((error) => {
        dispatch({ type: HAS_REQUESTED_ACCOUNTS, payload: true });
        dispatch({ type: IS_FETCHING_ACCOUNTS, payload: false });
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      });
  } else {
    return store.getState().accounts;
  }
};

export const createAccount = (token, account_info) => async (dispatch) => {
  const { first_name, middle_name, last_name, cognito_id, creator_id, user_type } = account_info;
  return API.post(
    Gateway.name,
    `/accounts/create/${cognito_id}`,
    {
      headers: {
        Authorization: token
      },
      body: {
        "account_name": `${first_name} ${middle_name} ${last_name}`,
        "beneficiary_id": cognito_id,
        "cognito_id": creator_id,
        "account_id": store.getState().session.account_id,
        user_type
      }
    }).then((newAccount) => {
      return newAccount;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateCoreAccount = (updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/accounts/update-single-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    })
    .then(() => {
      dispatch(authenticated.login());
      return { success: true };
    })
    .catch(() => {
      return { success: false };
    });
};

export const linkAccount = (referral_code) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Linking Account..." } });
  return API.post(
    Gateway.name,
    `/accounts/associate/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        referral_code: referral_code.toUpperCase().replace(/\s+/g, ""),
        requester: store.getState().user
      }
    })
    .then((link) => {
      if (link.success) {
        dispatch({ type: CREATE_NEW_RELATIONSHIP, payload: link.payload.user });
        dispatch(showNotification("success", "Account Linked", `Your account was linked to ${link.payload.user.first_name} ${link.payload.user.last_name}.`));
      } else {
        dispatch(showNotification("error", "Account Link Failed", "We could not link this account."));
      }
      dispatch(getAccounts(store.getState().user.cognito_id, store.getState().session.account_id, true));
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(logEvent("account linked by referral code", store.getState().user));
      return link;
    })
    .catch((error) => {
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(showNotification("error", "Account Link", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const linkAccountByEmail = (email, account_id) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Linking Account..." } });
  return API.post(
    Gateway.name,
    `/accounts/link-user-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        email: email.toLowerCase().replace(/\s+/g, ""),
        requester: store.getState().user,
        link_to: account_id
      }
    })
    .then((link) => {
      if (link.success) {
        dispatch(showNotification("success", "Account Linked", `Your account was linked to ${link.payload.user.first_name} ${link.payload.user.last_name}. The account owner will need to approve the link before they can access your account.`));
      } else {
        dispatch(showNotification("error", "Account Link Failed", "We could not link this account."));
      }
      dispatch(getAccounts(store.getState().user.cognito_id, account_id, true));
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(logEvent("account linked by email", store.getState().user));
      return link;
    })
    .catch((error) => {
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(showNotification("error", "Account Link", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const switchAccounts = (account) => async (dispatch) => {
  const primary_account_id = store.getState().session.primary_account_id;
  const is_switching = primary_account_id !== account.account_id ? true : false;
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Switching Accounts..." } });
  return Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user) => {
      const token = user.signInUserSession.idToken.jwtToken;
      dispatch({ type: CLEAR_ALL });
      dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: account.account_id, token, user } });
      return dispatch(getAccounts(user.username, account.account_id))
      .then(async (accounts) => {
        return dispatch(getCurrentUser())
          .then(async (storedUser) => {
            dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
            dispatch({ type: IS_SWITCHING, payload: { is_switching, primary_account_id } });
            if (account.account_id !== primary_account_id) {
              dispatch({
                type: SHOW_NOTIFICATION,
                payload: {
                  message: `You are viewing ${account.first_name} ${account.last_name}'s account.`,
                  type: "info",
                  action: "BACK_TO_CORE_ACCOUNT",
                  button_text: "Leave Account",
                  timeout: null,
                  hide_close: true,
                  pages: ["/accounts"]
                }
              });
            } else {
              dispatch({ type: HIDE_NOTIFICATION });
            }
            return dispatch(redirectAfterSwitch(is_switching))
              .then(async () => {
                dispatch(showNotification("success", "Account Switched", `You switched accounts. You're now viewing ${account.first_name} ${account.last_name}'s account.`));
                dispatch(logEvent("switched accounts", store.getState().user));
                return true;
              });
        });
      })
      .catch((error) => {
        dispatch({ type: IS_SWITCHING, payload: { is_switching: false, primary_account_id } });
        dispatch({ type: HIDE_LOADER });
        dispatch(showNotification("error", "Account Switch", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
        return false;
      });
    })
    .catch((error) => {
      dispatch({ type: IS_SWITCHING, payload: { is_switching: false, primary_account_id } });
      dispatch({ type: HIDE_LOADER });
      dispatch(showNotification("error", "Account Switch", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return false;
    });
};

export const getCustomerTransactions = (override = false, customer_id) => async (dispatch) => {
  const customer = customer_id ? store.getState().relationship.list.find((r) => r.customer_id === customer_id)  : store.getState().relationship.list.find((r) => r.customer_id && !r.linked_account);
  if (customer && ((!store.getState().account.isFetchingTransactions && !store.getState().account.requestedTransactions) || override)) {
    dispatch({ type: IS_FETCHING_TRANSACTIONS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/accounts/get-customer-transactions/${customer.customer_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACCOUNT_TRANSACTIONS, payload: data.payload });
        dispatch({ type: IS_FETCHING_TRANSACTIONS, payload: false });
        return data;
      } else {
        dispatch({ type: HAS_REQUESTED_CUSTOMER_TRANSACTIONS, payload: true });
        dispatch({ type: IS_FETCHING_TRANSACTIONS, payload: false });
        return data;
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_CUSTOMER_TRANSACTIONS, payload: true });
      dispatch({ type: IS_FETCHING_TRANSACTIONS, payload: false });
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    }
  }
};

export const getAccountFeatures = (account_id) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/accounts/get-account-features/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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

export const getCustomerSubscriptions = (override = false, customer_id = store.getState().user.customer_id) => async (dispatch) => {
  if (customer_id && ((!store.getState().account.isFetchingSubscriptions && !store.getState().account.requestedSubscriptions) || override)) {
    dispatch({ type: IS_FETCHING_SUBSCRIPTIONS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/accounts/get-customer-subscriptions/${customer_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACCOUNT_SUBSCRIPTIONS, payload: data.payload });
        dispatch({ type: IS_FETCHING_SUBSCRIPTIONS, payload: false });
        return data;
      } else {
        dispatch({ type: HAS_REQUESTED_CUSTOMER_SUBSCRIPTIONS, payload: true });
        dispatch({ type: IS_FETCHING_SUBSCRIPTIONS, payload: false });
        return data;
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_CUSTOMER_SUBSCRIPTIONS, payload: true });
      dispatch({ type: IS_FETCHING_SUBSCRIPTIONS, payload: false });
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    }
  }
};

export const cancelSubscription = (id, subscription_id, transfer_customer_id, transfer_cognito_id, free_plan, current_plan) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/accounts/cancel-subscription/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        id,
        subscription_id,
        transfer_customer_id,
        transfer_cognito_id,
        free_plan,
        current_plan,
        partner_customer_id: store.getState().user.customer_id
      }
    })
    .then((created) => {
      dispatch(getCustomerSubscriptions(true, store.getState().user.customer_id));
      dispatch(getCustomerTransactions(store.getState().user.customer_id, true));
      dispatch(logEvent("client subscription cancelled", store.getState().user));
      return created.success;
    })
    .catch((error) => {
      dispatch(showNotification("error", "Subscription Cancellation", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const initiateSubscriptionCancellation = (subscription) => async (dispatch) => {
  const current_partner_subscription = store.getState().account.subscriptions.active.find((s) => s.type === "partner") || {};
  const cancelled_subscriptions = store.getState().account.subscriptions.cancelled.filter((s) => s.type === "user");
  const can_cancel = cancelled_subscriptions.length < (current_partner_subscription.max_cancellations || 0);
  const remaining_cancellations = can_cancel ? (current_partner_subscription.max_cancellations - cancelled_subscriptions.length) : 0;
  const free_plan = store.getState().plans.active_user_plans.find((p) => p.name === "Free");
  const current_plan = store.getState().plans.active_user_plans.find((p) => p.price_id === subscription.price_id);
  const cancelOptions = {
    onOk: async () => {
      return dispatch(cancelSubscription(subscription.id, subscription.subscription_id, subscription.transfer_customer_id, subscription.transfer_cognito_id, free_plan, current_plan))
      .then(async () => {
        const unlinkOptions = {
          onOk: async () => dispatch(deleteMembership(subscription.membership_id)).then(() => authenticated.login()),
          onCancel: () => toastr.removeByType("confirms"),
          okText: "Yes",
          cancelText: "No"
        };
        toastr.confirm("Would you like to unlink this account? You will no longer have access to this account.\n\nIf you have added any payment methods on this account, please be sure to remove or replace all credit card information prior to unlinking.", unlinkOptions);
      });
    },
    onCancel: () => toastr.removeByType("confirms"),
    okText: "Understood",
    cancelText: "Close"
  };
  toastr.confirm(`Are you sure you want to cancel this subscription? It will no longer be managed by you. The monthly subscription will be cancelled and the account will be downgraded to a Free account.\n\nYou have ${remaining_cancellations} remaining ${remaining_cancellations === 1 ? "cancellation" : "cancellations"}. If you use all of your allotted cancellations, you will need to contact support to be considered for a cancellation increase.`, cancelOptions);
};

export const cancelAccountSubscripton = (type, line_items, total, coupon, current_plan, free_plan, active_subscription, account_customer) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/accounts/cancel-account-subscription/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        type,
        line_items,
        total,
        coupon,
        free_plan,
        current_plan,
        active_subscription,
        account_customer
      }
    })
    .then((created) => {
      dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Refreshing Account..." } });
      dispatch(showNotification("success", "Subscription Cancellation", "Subscription cancelled successfully. Updating Account..."));
      dispatch(logEvent("account subscription cancelled", store.getState().user));
      const account_id = store.getState().session.account_id;
      const primary_account_id = store.getState().session.primary_account_id || account_id;
      const is_switching = store.getState().session.is_switching;
      const current_account = store.getState().accounts.find((account) => account.account_id === account_id);
      return Auth.currentAuthenticatedUser({ bypassCache: true })
        .then(async (user) => {
          const token = user.signInUserSession.idToken.jwtToken;
          dispatch({ type: CLEAR_ALL });
          dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token, user } });
          return dispatch(getAccounts(user.username, account_id, true))
          .then(async (accounts) => {
            return dispatch(getCurrentUser())
              .then(async (storedUser) => {
                dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                dispatch({ type: IS_SWITCHING, payload: { is_switching, primary_account_id } });
                if (account_id !== primary_account_id) {
                  dispatch({
                    type: SHOW_NOTIFICATION,
                    payload: {
                      message: `You are viewing ${current_account.first_name} ${current_account.last_name}'s account.`,
                      type: "info",
                      action: "BACK_TO_CORE_ACCOUNT",
                      button_text: "Leave Account",
                      timeout: null,
                      hide_close: true,
                      pages: ["/accounts"]
                    }
                  });
                } else {
                  dispatch({ type: HIDE_NOTIFICATION });
                }
                dispatch(navigateTo("/accounts"));
                return true;
              });
          })
          .catch((error) => {
            dispatch({ type: IS_SWITCHING, payload: { is_switching, primary_account_id } });
            dispatch({ type: SHOW_LOADER, payload: { show: false } });
            dispatch(showNotification("error", "Account Refresh", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
            return false;
          });
        })
        .catch((error) => {
          dispatch({ type: IS_SWITCHING, payload: { is_switching, primary_account_id } });
          dispatch({ type: SHOW_LOADER, payload: { show: false } });
          dispatch(showNotification("error", "Account Refresh", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
          return false;
        });
    })
    .catch((error) => {
      dispatch(showNotification("error", "Subscription Cancellation", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const updateSubscriptionRecord = (account_id, subscription_id, updates, type) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/accounts/update-subscription-record/${subscription_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    })
    .then((created) => {
      if (type === "user") dispatch({ type: UPDATE_ACCOUNT_RECORD, payload: { updates: created.payload, account_id } });
      if (type === "partner") dispatch({ type: UPDATE_PARTNER_ACCOUNT_RECORD, payload: { updates: created.payload, account_id } });
      dispatch(logEvent("subscription updated", store.getState().user));
      return created.success;
    })
    .catch((error) => {
      if (error && error.response) dispatch(showNotification("error", "Subscription Transfer", error.response.data.message));
      return { success: false };
    });
};

export const openAddNewUserModal = () => async (dispatch) => {
  dispatch({ type: OPEN_ADD_NEW_USER_MODAL });
  dispatch(logEvent("add-user", store.getState().user, "modal"));
};

export const closeAddNewUserModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_ADD_NEW_USER_MODAL });
};

export const openCreateAccountModal = ({ is_partner_creation, is_user_creation }) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_ACCOUNT_MODAL, payload: { is_partner_creation, is_user_creation } });
  dispatch(logEvent("create-account", store.getState().user, "modal"));
};

export const closeCreateAccountModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_ACCOUNT_MODAL });
  dispatch({ type: CLEAR_SIGNUP_STATE });
};

export const changeAccountsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_ACCOUNTS_TAB, payload: tab });
  dispatch(logEvent("accounts tab switched", store.getState().user));
};