import { Auth, API } from "aws-amplify";
import { apiGateway } from "../../config";
import {
  UPDATE_SESSION,
  IS_LOGGED_IN,
  UPDATE_RELATIONSHIP,
  SET_SESSION_ACCOUNT,
  IS_REGISTERED,
  SET_NOTIFICATION_SETTINGS,
  CHANGE_FORM_SLIDE,
  UPDATE_CLIENT_REGISTRATION,
  UPDATE_PARTNER_REGISTRATION,
  SHOW_LOADER,
  HIDE_LOADER,
  IS_FETCHING_NOTIFICATION_SETTINGS
} from "./constants";
import { showNotification } from "./notification";
import { store } from "..";
import moment from "moment";
import { getDatabase, ref, set, update, onDisconnect, get, onValue, increment } from "firebase/database";
import firebase_app from "../../firebase";
import { getUA } from "../../utilities";
import { logEvent } from "./utilities";
import authentication from "./authentication";
import { getRelationships } from "./account";
const db = getDatabase(firebase_app);
const Gateway = apiGateway.find((gateway) => gateway.name === "users");

export const getCurrentUser = (cognito_id, passed_token, account_id) => async (dispatch) => {
  return Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user) => {
      const token = user.signInUserSession.idToken.jwtToken;
      const storedUser = await API.get(Gateway.name, `/${user.username}/${(account_id || store.getState().session.account_id)}`, { headers: { Authorization: token || store.getState().session.token } });
      if (storedUser.success) {
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { token, user } });
        dispatch({ type: IS_REGISTERED, payload: storedUser.payload });
        return storedUser;
      }
      return storedUser;
    })
    .catch(async (error) => {
      const storedUser = await API.get(Gateway.name, `/${cognito_id}`, { headers: { Authorization: passed_token || store.getState().session.token } });
      if (storedUser.success) return storedUser;
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const getUser = (cognito_id, account_id) => async (dispatch) => {
  return await API.get(Gateway.name, `/${cognito_id}/${account_id}`, { headers: { Authorization: store.getState().session.token } });
};

export const createUser = (newUser, cognito_id, token) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/${cognito_id}/create`, {
      headers: {
        Authorization: token
      },
      body: newUser
    })
    .then((newUser) => {
      return newUser;
    })
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const createAccountUser = (data) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/${store.getState().user.cognito_id}/create-account-user`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: data
    })
    .then((newUser) => {
      return newUser;
    })
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const forgotPassword = (email) => async (dispatch) => {
  if (email) {
    return API.get(Gateway.name, "/forgot-password", { queryStringParameters: { email } }).then((reset) => {
      if (reset.success && reset.flow === "login") {
        dispatch(showNotification("success", "Temporary Password Sent", "We have reset your password, check your email for further instructions."));
        return { success: true };
      } else if (reset.success && reset.flow === "forgot-password") {
        return Auth.forgotPassword((email).toLowerCase())
          .then((d) => {
            dispatch(showNotification("success", "Temporary Password Sent", "We have reset your password, check your email for further instructions."));
            return { success: true };
          })
          .catch((error) => {
            dispatch(showNotification("error", "Email Error", error.message));
            return { success: false, message: error.message };
          });
      }
    }).catch((error) => {
      dispatch(showNotification("error", "Email Error", error.response && error.response.data ? error.response.data.message : "Something went wrong."));
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
  } else {
    dispatch(showNotification("error", "Email Error", "You must provide an email to reset your password."));
    return { success: false, message: "You must provide an email to reset your password." };
  }
};

export const confirmForgotPassword = (email, code, password) => async (dispatch) => {
  if (email && code && password) {
    return Auth.forgotPasswordSubmit((email).toLowerCase(), code, password)
      .then(() => {
        dispatch(showNotification("success", "Your password was reset!", "Please login with your new password."));
        return { success: true };
      })
      .catch((error) => {
        dispatch(showNotification("error", "Password Error", error.response && error.response.data ? error.response.data.message : "Something went wrong."));
        return { success: false, error };
      });
  } else {
    return { success: false, error: { message: "You must provide an email, verification code, and password to confirm." } };
  }
};

export const updateUserStatus = (cognito_id, status, idle = false, is_login = false) => async (dispatch) => {
  if (cognito_id) {
    const connectedRef = ref(db, ".info/connected");
    const presence = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/${cognito_id}`);
    const previous_data = await get(presence).then((snapshot) => snapshot.val()).catch(() => false);
    if (!previous_data || moment(previous_data.last_activity).isBefore(moment(), "day")) {
      const count_ref = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/daily_logins/${moment().format("YYYY")}/${moment().format("MM")}/${moment().format("DD")}`);
      set(count_ref, { online: increment(1) });
    }
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(presence).update({ online: false, idle: false, last_activity: Date.now() });
        update(presence, { online: true, idle: false, last_activity: Date.now(), device: getUA() });
      } else {
        update(presence, { online: false, idle: false, last_activity: Date.now(), device: getUA() });
      }
    });
    dispatch({ type: UPDATE_SESSION, payload: { idle } });
    let updates = { online: status, idle, last_activity: Date.now(), device: getUA() };
    if (is_login && previous_data && previous_data.logins) updates.logins = increment(1);
    if (is_login && (!previous_data || (previous_data && !previous_data.logins))) updates.logins = 1;
    update(presence, updates);
  }
};

export const updateUser = (updates, token, notify = true) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/update/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: token || store.getState().session.token
      },
      body: {
        updates
      }
    }).then((updatedUser) => {
      if (updatedUser.success) {
        localStorage.removeItem("react-avatar/failing");
        dispatch(getRelationships(true));
        dispatch({ type: IS_LOGGED_IN, payload: updatedUser.payload });
        dispatch({ type: UPDATE_RELATIONSHIP, payload: updatedUser.payload });
        if (notify) dispatch(showNotification("success", "Profile Updated", "Profile was successfully updated."));
        return updatedUser;
      }
    }).catch((error) => {
      if (notify) dispatch(showNotification("error", "Profile Updated", (error.response && error.response.data) ? error.response.data.message : "Something went wrong."));
      return {
        success: false,
        error
      };
    });
};

export const changeUserPassword = (oldPassword, newPassword) => async (dispatch) => {
  const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
  return Auth.changePassword(user, oldPassword, newPassword)
  .then((status) => {
    if (status === "SUCCESS") {
      return { success: true, message: "Password was updated."};
    }
    return { success: false, message: "Password was not updated."};
  })
  .catch((error) => {
    return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
  });
};

export const changeUserEmail = (newEmail) => async (dispatch) => {
  const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
  return Auth.updateUserAttributes(user, { email: (newEmail).toLowerCase() })
    .then((status) => {
      if (status === "SUCCESS") {
        return { success: true, message: "Email was updated." };
      }
      return { success: false, message: "Email was not updated." };
    })
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const checkUserEmail = (email = "") => async (dispatch) => {
  if (email) {
    email = ((email).toLowerCase()).replace(/\s+/g, "");
    return API.get(Gateway.name, `/check-email/${email}`).then((user) => {
      return user;
    }).catch((error) => {
      if (error.response) return error.response.data;
      return { success: false };
    });
  } else {
    return { success: false };
  }
};

export const checkUsername = (username) => async (dispatch) => {
  if (username) {
    username = ((username).toLowerCase()).replace(/\s+/g, "");
    return API.get(Gateway.name, `/check-username/${username}`).then((user) => {
      return user;
    }).catch((error) => {
      if (error.response) return error.response.data;
      return { success: false };
    });
  } else {
    return { success: false };
  }
};

export const setupMFA = () => async (dispatch) => {
  const state = store.getState();
  const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
  return Auth.setPreferredMFA(user, "SMS").then(async () => {
    const storedUser = await API.get(Gateway.name, `/${state.user.cognito_id}`, { headers: { Authorization: state.session.token } });
    const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: state.session.account_id, token: state.session.token, user: currentUser } });
    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
    dispatch(logEvent("mfa activated", state.user));
    return { success: true };
  }).catch((error) => {
    return { success: false, error };
  });
};

export const resetMFA = () => async (dispatch) => {
  const state = store.getState();
  const disabled = await API.get(
    Gateway.name,
    `/reset-user-mfa/${state.session.account_id}/${state.user.cognito_id}/${state.session.user.signInUserSession.accessToken.jwtToken}`,
    {
      headers: {
        Authorization: state.session.token
      }
    });
  if (disabled.success) {
    const storedUser = await API.get(Gateway.name, `/${state.user.cognito_id}`, { headers: { Authorization: state.session.token } });
    const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: state.session.account_id, token: state.session.token, user: currentUser } });
    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
    dispatch(logEvent("mfa turned off", state.user));
    return { success: true };
  } else {
    return { success: false, error: { message: disabled.message } };
  }
};

export const refreshUser = () => async (dispatch) => {
  Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user) => {
      const session = await Auth.currentSession();
      dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: store.getState().session.account_id, token: session.idToken.jwtToken, user } });
    })
    .catch(() => {
      dispatch(authentication.logOut());
    });
};

export const createUserNotificationPreferences = (account_id, cognito_id) => async (dispatch) => {
  const created = await API.post(
    Gateway.name,
    `/settings/notifications/create/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        "notificationInfo": {
          "money_distribution_email": true,
          "service_scheduled_email": true,
          "appointment_upcoming_email": true,
          "money_distribution_sms": true,
          "service_scheduled_sms": true,
          "appointment_upcoming_sms": true,
          "money_distribution_push": true,
          "service_scheduled_push": true,
          "appointment_upcoming_push": true
        },
        create_account_id: account_id,
        create_cognito_id: cognito_id
      }
    });
  if (created && created.success) {
    dispatch({ type: SET_NOTIFICATION_SETTINGS, payload: created.payload });
  }
};

export const updateUserNotificationPreferences = (updates) => async (dispatch) => {
  const updated = await API.patch(
    Gateway.name,
    `/settings/notifications/update/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    });
  if (updated && updated.success) {
    dispatch({ type: SET_NOTIFICATION_SETTINGS, payload: updated.payload });
  }
};

export const getUserNotificationPreferences = () => async (dispatch) => {
  if (!store.getState().settings.isFetching && !store.getState().settings.requested) {
    dispatch({ type: IS_FETCHING_NOTIFICATION_SETTINGS, payload: true });
    try {
      const settings = await API.get(
        Gateway.name,
        `/settings/notifications/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (settings && settings.success) {
        dispatch({ type: SET_NOTIFICATION_SETTINGS, payload: settings.payload });
        dispatch({ type: IS_FETCHING_NOTIFICATION_SETTINGS, payload: false });
      } else {
        dispatch({ type: IS_FETCHING_NOTIFICATION_SETTINGS, payload: false });
      }
    } catch (error) {
      dispatch({ type: IS_FETCHING_NOTIFICATION_SETTINGS, payload: false });
    }
  }
};

export const cancelSignup = (email, restart = false) => async (dispatch) => {
  if (email) {
    email = email.toLowerCase().replace(/\s+/g, "");
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Cancelling..." } });
    return API.get(Gateway.name, `/cancel-signup/${email}`).then((user) => {
      dispatch({ type: HIDE_LOADER });
      dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "is_verifying", value: false } });
      dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "verification_code", value: "" } });
      dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "is_verifying", value: false } });
      dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "verification_code", value: "" } });
      if (restart) {
        dispatch({ type: CHANGE_FORM_SLIDE, payload: 0 });
      } else {
        dispatch({ type: CHANGE_FORM_SLIDE, payload: store.getState().multi_part_form.slide - 1 });
      }
      return { ...user, success: true };
    }).catch((error) => {
      if (restart) {
        dispatch({ type: CHANGE_FORM_SLIDE, payload: 0 });
      } else {
        dispatch({ type: CHANGE_FORM_SLIDE, payload: store.getState().multi_part_form.slide - 1 });
      }
      dispatch({ type: HIDE_LOADER });
      if (error.response) return error.response.data;
      return { success: false };
    });
  }
};