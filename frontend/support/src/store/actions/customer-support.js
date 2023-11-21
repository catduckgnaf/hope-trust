import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import moment from "moment";
import {
  GET_ALL_ACCOUNTS,
  IS_FETCHING_ALL_ACCOUNTS,
  HAS_REQUESTED_ALL_ACCOUNTS,
  UPDATE_DAILY_LOGINS,
  IS_FETCHING_DAILY_LOGINS,
  HAS_REQUESTED_DAILY_LOGINS,
  UPDATE_REFRESH_STATE,
  CHANGE_CUSTOMER_SUPPORT_SETTINGS_TAB,
  CHANGE_CUSTOMER_SUPPORT_ACCOUNTS_TAB,
  CHANGE_CUSTOMER_SUPPORT_PLANS_TAB,
  CHANGE_CUSTOMER_SUPPORT_BENEFITS_TAB,
  CHANGE_CUSTOMER_SUPPORT_BENEFITS_APPROVAL_TAB,
  GET_ALL_PARTNERS,
  IS_FETCHING_ALL_PARTNERS,
  HAS_REQUESTED_ALL_PARTNERS,
  IS_FETCHING_ALL_TRANSACTIONS,
  GET_ALL_ACCOUNT_TRANSACTIONS,
  HAS_REQUESTED_ALL_TRANSACTIONS,
  IS_FETCHING_CORE_SETTINGS,
  IS_FETCHING_ALL_USERS,
  HAS_REQUESTED_CORE_SETTINGS,
  CHANGE_CUSTOMER_SUPPORT_CORE_SETTINGS_TAB,
  CHANGE_CUSTOMER_SUPPORT_LEADS_TAB,
  HAS_REQUESTED_ALL_USERS,
  GET_ALL_USERS,
  GET_CORE_SETTINGS,
  UPDATE_CORE_SETTINGS,
  GET_USER_RECORD,
  UPDATE_USER_RECORD,
  OPEN_USER_UPDATE_MODAL,
  CLOSE_USER_UPDATE_MODAL,
  OPEN_ADD_MEMBERSHIP_MODAL,
  CLOSE_ADD_MEMBERSHIP_MODAL,
  IS_FETCHING_CS_USERS,
  GET_ALL_CS_USERS,
  HAS_REQUESTED_ALL_CS_USERS,
  IS_FETCHING_PENDING_APPROVALS,
  GET_PENDING_APPROVALS,
  HAS_REQUESTED_PENDING_APPROVALS,
  IS_FETCHING_BENEFITS_CONFIGS,
  GET_BENEFITS_CONFIGS,
  HAS_REQUESTED_BENEFITS_CONFIGS,
  UPDATE_BENEFITS_CONFIG
} from "./constants";
import { store } from "..";
import { uniqBy  } from "lodash";
import firebase_app from "../../firebase";
import { getDatabase, ref, get } from "firebase/database";
const db = getDatabase(firebase_app);
const Gateway = apiGateway.find((gateway) => gateway.name === "accounts");

export const customerServiceGetAllUsers = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingAllUsers && !store.getState().customer_support.requestedAllUsers) || override) {
    dispatch({ type: IS_FETCHING_ALL_USERS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/get-all-users/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_ALL_USERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ALL_USERS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_ALL_USERS, payload: true });
        dispatch({ type: IS_FETCHING_ALL_USERS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: GET_ALL_USERS, payload: [] });
      dispatch({ type: HAS_REQUESTED_ALL_USERS, payload: true });
      dispatch({ type: IS_FETCHING_ALL_USERS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const customerServiceGetCSUsers = (override = false) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingCSUsers && !store.getState().customer_support.requestedCSUsers) || override) {
    dispatch({ type: IS_FETCHING_CS_USERS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/get-cs-users/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_ALL_CS_USERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_CS_USERS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_ALL_CS_USERS, payload: true });
        dispatch({ type: IS_FETCHING_CS_USERS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_ALL_CS_USERS, payload: true });
      dispatch({ type: IS_FETCHING_CS_USERS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const customerServiceGetPendingApprovals = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.requestedPendingApprovals && !store.getState().customer_support.isFetchingPendingApprovals) || override) {
    dispatch({ type: IS_FETCHING_PENDING_APPROVALS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/get-pending-approvals/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_PENDING_APPROVALS, payload: data.payload });
        dispatch({ type: IS_FETCHING_PENDING_APPROVALS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_PENDING_APPROVALS, payload: true });
        dispatch({ type: IS_FETCHING_PENDING_APPROVALS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: GET_PENDING_APPROVALS, payload: [] });
      dispatch({ type: HAS_REQUESTED_PENDING_APPROVALS, payload: true });
      dispatch({ type: IS_FETCHING_PENDING_APPROVALS, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const getDailyLogins = (override, days) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingDailyLogins && !store.getState().customer_support.requestedDailyLogins) || override) {
    dispatch({ type: IS_FETCHING_DAILY_LOGINS, payload: true });
    try {
      const previous_date = moment().subtract(days, "day");
      const previous_logins_ref = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/daily_logins/${previous_date.format("YYYY")}`);
      const previous = await get(previous_logins_ref).then((snapshot) => snapshot.val()).catch(() => false);
      if (previous) {
        dispatch({ type: UPDATE_DAILY_LOGINS, payload: { previous_logins: previous } });
        dispatch({ type: IS_FETCHING_DAILY_LOGINS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_DAILY_LOGINS, payload: true });
        dispatch({ type: IS_FETCHING_DAILY_LOGINS, payload: false });
      }
      return previous;
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_DAILY_LOGINS, payload: true });
      dispatch({ type: IS_FETCHING_DAILY_LOGINS, payload: false });
      return { success: false, error  };
    }
  }
};

export const getUserRecord = (cognito_id) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/get-user-record/${store.getState().session.account_id}/${store.getState().user.cognito_id}/${cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((user) => {
      if (user.success) dispatch({ type: GET_USER_RECORD, payload: user.payload });
      return user;
    }).catch((error) => {
      dispatch(showNotification("error", "User Fetch", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};

export const customerServiceGetAllAccounts = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetching && !store.getState().customer_support.requested) || override) {
    dispatch({ type: IS_FETCHING_ALL_ACCOUNTS, payload: true });
    return API.get(
      Gateway.name,
      `/get-all-accounts/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          "Authorization": store.getState().session.token
        }
      })
      .then((data) => {
        dispatch({ type: GET_ALL_ACCOUNTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ALL_ACCOUNTS, payload: false });
        return data.payload;
      })
      .catch((error) => {
        dispatch({ type: HAS_REQUESTED_ALL_ACCOUNTS, payload: true });
        dispatch({ type: IS_FETCHING_ALL_ACCOUNTS, payload: false });
        return {
          success: false,
          error
        };
      });
  }
};

export const sendClientInvite = (config) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/send-client-invitation/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        config
      }
    }).then((data) => {
      if (data.success) dispatch(showNotification("success", "Client Invitation", `Invitation successfully resent to ${config.invite_first} ${config.invite_last}`));
      dispatch({ type: UPDATE_BENEFITS_CONFIG, payload: data.payload });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const customerServiceGetAllBenefitsConfigs = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingBenefitsConfigs && !store.getState().customer_support.requestedBenefitsConfigs) || override) {
    dispatch({ type: IS_FETCHING_BENEFITS_CONFIGS, payload: true });
    return API.get(
      Gateway.name,
      `/get-all-client-configs/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          "Authorization": store.getState().session.token
        }
      })
      .then((data) => {
        dispatch({ type: GET_BENEFITS_CONFIGS, payload: data.payload });
        dispatch({ type: IS_FETCHING_BENEFITS_CONFIGS, payload: false });
        return data.payload;
      })
      .catch((error) => {
        dispatch({ type: HAS_REQUESTED_BENEFITS_CONFIGS, payload: true });
        dispatch({ type: IS_FETCHING_BENEFITS_CONFIGS, payload: false });
        return {
          success: false,
          error
        };
      });
  }
};

export const customerServiceGetAllPartners = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingPartners && !store.getState().customer_support.requestedPartners) || override) {
    dispatch({ type: IS_FETCHING_ALL_PARTNERS, payload: true });
    return API.get(
      Gateway.name,
      `/get-all-partner-accounts/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          "Authorization": store.getState().session.token
        }
      })
      .then((data) => {
        dispatch({ type: GET_ALL_PARTNERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ALL_PARTNERS, payload: false });
        return data.payload;
      })
      .catch((error) => {
        dispatch({ type: HAS_REQUESTED_ALL_PARTNERS, payload: true });
        dispatch({ type: IS_FETCHING_ALL_PARTNERS, payload: false });
        return {
          success: false,
          error
        };
      });
  }
};

export const getAllTransactions = (override = false) => async (dispatch) => {
  if ((!store.getState().account.isFetchingAllTransactions && !store.getState().account.requestedAllTransactions) || override) {
    dispatch({ type: IS_FETCHING_ALL_TRANSACTIONS, payload: true });
    return API.get(
      Gateway.name,
      `/get-all-transactions/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      })
      .then((data) => {
        dispatch({ type: GET_ALL_ACCOUNT_TRANSACTIONS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ALL_TRANSACTIONS, payload: false });
        return data;
      })
      .catch((error) => {
        dispatch({ type: HAS_REQUESTED_ALL_TRANSACTIONS, payload: true });
        dispatch({ type: IS_FETCHING_ALL_TRANSACTIONS, payload: false });
        return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
      });
  }
};

export const getCoreSettings = (override) => async (dispatch) => {
  if ((!store.getState().customer_support.isFetchingCoreSettings && !store.getState().customer_support.requestedCoreSettings) || override) {
    dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: true });
    return API.get(Gateway.name, "/get-core-settings")
    .then((data) => {
      dispatch({ type: GET_CORE_SETTINGS, payload: data.payload });
      dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: false });
      if (data.payload.support_debug) window.LOG_LEVEL = "DEBUG";
      return data.payload;
    })
    .catch((error) => {
      dispatch({ type: HAS_REQUESTED_CORE_SETTINGS, payload: true });
      dispatch({ type: IS_FETCHING_CORE_SETTINGS, payload: false });
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
  }
};

export const updateCoreSettings = (updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update-core-settings/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) dispatch({ type: UPDATE_CORE_SETTINGS, payload: data.payload });
      return data;
    }).catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const updateUserRecord = (cognito_id, updates, type, balance) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update-user-record/${store.getState().session.account_id}/${store.getState().user.cognito_id}/${cognito_id}`,
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
      if (updatedUser.success) {
        if (updatedUser.payload.type !== "support") dispatch({ type: UPDATE_USER_RECORD, payload: updatedUser.payload });
        if (updatedUser.payload.type === "customer-support") dispatch(customerServiceGetCSUsers(true));
        dispatch(showNotification("success", "User Updated", `${updatedUser.payload.first_name} was successfully updated.`));
      }
      return updatedUser;
    }).catch((error) => {
      dispatch(showNotification("error", "User Update", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};

export const setSingleUserMFA = (cognito_id, type) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/set-user-mfa/${store.getState().session.account_id}/${store.getState().user.cognito_id}/${type}/${cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((user) => {
      if (user.success) dispatch(showNotification("success", "MFA Updated", user.message));
      return user;
    }).catch((error) => {
      dispatch(showNotification("error", "MFA Error", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};

export const resetSingleUserMFA = (cognito_id, type) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/reset-user-mfa/${store.getState().session.account_id}/${store.getState().user.cognito_id}/${type}/${cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((user) => {
      if (user.success) dispatch(showNotification("success", "MFA Updated", user.message));
      return user;
    }).catch((error) => {
      dispatch(showNotification("error", "MFA Error", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};

export const resetUserPassword = (cognito_id, type, email) => async (dispatch) => {
  return API.get(
    Gateway.name,
    `/reset-user-password/${store.getState().user.cognito_id}/${store.getState().session.account_id}/${type}/${cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      dispatch(showNotification("success", "Password Reset", `Great. A new temporary password has been sent to ${email}. It may take a few minutes to arrive.`));
      return { success: true };
    }).catch((error) => {
      dispatch(showNotification("error", "Password Reset Failed", `Could not reset password for ${email}`));
      return {
        success: false,
        error
      };
    });
};

export const changeSettingsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CUSTOMER_SUPPORT_SETTINGS_TAB, payload: tab });
};

export const changeAccountsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CUSTOMER_SUPPORT_ACCOUNTS_TAB, payload: tab });
};

export const changePlansTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CUSTOMER_SUPPORT_PLANS_TAB, payload: tab });
};

export const changeBenefitsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CUSTOMER_SUPPORT_BENEFITS_TAB, payload: tab });
};

export const changeBenefitsApprovalTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CUSTOMER_SUPPORT_BENEFITS_APPROVAL_TAB, payload: tab });
};

export const changeLeadsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CUSTOMER_SUPPORT_LEADS_TAB, payload: tab });
};

export const changeCoreSettingsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CUSTOMER_SUPPORT_CORE_SETTINGS_TAB, payload: tab });
};

export const openUserUpdateModal = (defaults, updating) => async (dispatch) => {
  dispatch({ type: OPEN_USER_UPDATE_MODAL, payload: { defaults, updating } });
};

export const closeUserUpdateModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_USER_UPDATE_MODAL });
};

export const openAddMembershipModal = (membership_type) => async (dispatch) => {
  dispatch({ type: OPEN_ADD_MEMBERSHIP_MODAL, payload: { membership_type } });
};

export const closeAddMembershipModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_ADD_MEMBERSHIP_MODAL });
};

export const updateRefreshState = (state) => async (dispatch) => {
  dispatch({ type: UPDATE_REFRESH_STATE, payload: state });
};

export let permissions = [
  {
    icon: "usd-circle",
    name: "Finances",
    description: "Allow limited or full access to Financial Data, Income, Beneficiary Assets, Financial Surveys, & Financial Overview",
    prefix: "finance",
    options: ["off", "view", "edit"],
    types: ["client"]
  },
  {
    icon: "usd-circle",
    name: "Access MYTO Simulations",
    description: "Allow limited or full access to run financial simulations using Assets, Income, and Expenses",
    prefix: "myto",
    options: ["off", "view", "edit"],
    types: ["client"]
  },
  {
    icon: "usd-circle",
    name: "Financial Budgeting",
    description: "Allow limited or full access to Expense details, monthly budgets, and expense categories",
    prefix: "budget",
    options: ["off", "view", "edit"],
    types: ["client"]
  },
  {
    icon: "usd-circle",
    name: "Grantor Assets",
    description: "Allow limited or full access to managing Grantor Assets",
    prefix: "grantor-assets",
    options: ["off", "view", "edit"],
    types: ["client"]
  },
  {
    icon: "user-shield",
    name: "Account Management",
    description: "Allow limited or full access to Account Management, Relationship Management, and Account configuration",
    prefix: "account-admin",
    options: ["off", "view", "edit"],
    types: ["client", "benefits", "advisor"]
  },
  {
    icon: "heartbeat",
    name: "Health & Life",
    description: "Allow limited or full access to alter Health Surveys, Health Overview, Providers, Medications and Scheduling",
    prefix: "health-and-life",
    options: ["off", "view", "edit"],
    types: ["client"]
  },
  {
    icon: "user-headset",
    name: "Request Hope Care Coordination",
    description: "Allow limited or full access to request services including: Money, Medical, Food, Transportation and custom requests",
    prefix: "request-hcc",
    options: ["off", "view", "edit"],
    types: ["client"]
  },
  {
    icon: "user-crown",
    name: "Administrator",
    description: "Basic administrator access to Hope Trust Customer Service",
    prefix: "hopetrust-super-admin",
    options: ["off", "on"],
    types: ["support"],
    isDisabled: true
  },
  {
    icon: "user",
    name: "User Management",
    description: "Access to manage application users, permissions and memberships",
    prefix: "hopetrust-users",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "users",
    name: "Client Management",
    description: "Access to manage application accounts and account information",
    prefix: "hopetrust-accounts",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "user-tie",
    name: "Partner Management",
    description: "Access to manage application partners and partner information",
    prefix: "hopetrust-partners",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "folders",
    name: "Document Management",
    description: "Access to manage account documents",
    prefix: "hopetrust-documents",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "user-hard-hat",
    name: "Benefits Management",
    description: "Access to manage employee benefits",
    prefix: "hopetrust-benefits",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "user-tie",
    name: "Organization Management",
    description: "Access to manage partner organizations and referral codes",
    prefix: "hopetrust-organizations",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "lock-alt",
    name: "Security Question Management",
    description: "Access to manage account security questions",
    prefix: "hopetrust-security-questions",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "boxes",
    name: "Commerce Management",
    description: "Access to manage commerce settings, application plans and products",
    prefix: "hopetrust-commerce",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "user-headset",
    name: "Ticket Management",
    description: "Access to manage, assign and dispatch application tickets",
    prefix: "hopetrust-tickets",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "envelope",
    name: "Message Management",
    description: "Access to manage, send and delete application messages",
    prefix: "hopetrust-messages",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "users",
    name: "Lead Management",
    description: "Access to create new sales leads",
    prefix: "hopetrust-leads",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "poll-people",
    name: "Surveys",
    description: "Access to create and manage care plan surveys",
    prefix: "hopetrust-surveys",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "school",
    name: "CE Management",
    description: "Access to manage CE courses, credits and state configurations",
    prefix: "hopetrust-ce",
    options: ["off", "view", "edit"],
    types: ["support"]
  },
  {
    icon: "cogs",
    name: "Core Settings",
    description: "Access to manage core applications settings",
    prefix: "hopetrust-core",
    options: ["off", "on"],
    types: ["support"]
  }
];

export const additional = [
  {
    icon: "crown",
    name: "System Settings (DANGER)",
    description: "Access to data and configuration settings",
    prefix: "hopetrust-super-settings",
    options: ["off", "on"],
    types: ["support"]
  }
];

export const adminOverride = () => async (dispatch) => {
  permissions = uniqBy([...permissions, ...additional], "prefix");
  return permissions;
};