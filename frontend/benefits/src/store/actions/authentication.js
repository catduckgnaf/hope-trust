import { Auth, API } from "aws-amplify";
import LogRocket from "logrocket";
import { apiGateway } from "../../config";
import { isPublicRoute, isGlobalRoute, getUA } from "../../utilities";
import { loadHubspotDefaults } from "../../hubspot-config";
import { navigateTo } from "./navigation";
import { getCoreSettings } from "./customer-support";
import { showNotification } from "./notification";
import { loadHubspotGenericDefaults } from "../../hubspot-config";
import { createOrUpdateHubspotContact } from "./user";
import { getAccountFeatures } from "./account";
import { store } from "..";
import { logEvent, getApplicationStatus } from "./utilities";
import { hotjar } from "react-hotjar";
import moment from "moment";
import { HIDE_NOTIFICATION, UPDATE_SESSION, SET_SESSION_ACCOUNT, CLEAR_SIGNUP_STATE, IS_LOGGED_OUT, IS_LOGGED_IN, SHOW_LOADER, HIDE_LOADER, IS_LOGGING_IN, CLEAR_ALL } from "./constants";
import firebase_app from "../../firebase";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, update, onDisconnect, get, onValue, increment } from "firebase/database";
const db = getDatabase(firebase_app);
const auth = getAuth(firebase_app);

const updateUserStatus = (cognito_id, status, idle = false, is_login = false) => async (dispatch) => {
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

const firebaseSignIn = async () => {
  return signInAnonymously(auth)
    .then((firebase_data) => {
      return { success: true, firebase_data };
    })
    .catch((error) => {
      return { success: false };
    });
};

const logOut = () => async (dispatch) => {
  dispatch(logEvent("logout", store.getState().user));
  window.HubSpotConversations.widget.close();
  window.HubSpotConversations.clear({ resetWidget: true });
  window.HubSpotConversations.widget.remove();
  return Auth.signOut()
    .then(async () => {
      dispatch(updateUserStatus(store.getState().user.cognito_id, false, false));
      dispatch({ type: CLEAR_ALL });
      dispatch({ type: IS_LOGGED_OUT });
      dispatch(navigateTo("/login"));
      loadHubspotGenericDefaults();
      return { success: true };
    })
    .catch(() => {
      dispatch({ type: CLEAR_ALL });
      dispatch({ type: IS_LOGGED_OUT });
      dispatch(navigateTo("/login"));
      loadHubspotGenericDefaults();
      return { success: false };
    });
};
const login = (user, resetting = false) => async (dispatch) => {
  if (!store.getState().login.is_logging_in) {
    if (store.getState().user) if (isPublicRoute(store.getState().router.location.pathname) && !isGlobalRoute(store.getState().router.location.pathname)) dispatch(navigateTo("/"));
    dispatch({ type: IS_LOGGING_IN, payload: true });
    if (user) {
      const { email, password } = user;
      return Auth.signIn({ username: (email).toLowerCase(), password })
        .then(async (loggedInUser) => {
          if (loggedInUser.challengeName === "SMS_MFA") {
            return { success: true, user: loggedInUser, email };
          } else if (loggedInUser.challengeName === "NEW_PASSWORD_REQUIRED") {
            return { success: true, user: loggedInUser, email };
          } else {
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Authenticating..." } });
            const token = loggedInUser.signInUserSession.idToken.jwtToken;
            const storedUser = await API.get(apiGateway.NAME, `/users/${loggedInUser.username}`, { headers: { Authorization: token } });
            if (storedUser.success) {
              await firebaseSignIn();
              dispatch(updateUserStatus(storedUser.payload.cognito_id, true, false, true));
              let currentAccount = storedUser.payload.primary_account;
              if (!currentAccount) currentAccount = storedUser.payload.accounts.find((a) => !a.linked_account);
              if (!currentAccount) currentAccount = storedUser.payload.accounts[0];
              if (!currentAccount) {
                dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                dispatch({ type: IS_LOGGING_IN, payload: false });
                dispatch(navigateTo("/account-registration", "?no_accounts=true"));
                dispatch({ type: HIDE_LOADER });
                return { success: false };
              }
              window.HubSpotConversations.widget.remove();
              dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: currentAccount.account_id, token, user: loggedInUser, primary_account_id: currentAccount.account_id, is_resetting: resetting } });
              if (!storedUser.payload.is_partner) dispatch(navigateTo("/"));
              if (storedUser.payload.is_partner) dispatch(navigateTo("/accounts"));
              dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
              dispatch(createOrUpdateHubspotContact(storedUser.payload.hubspot_contact_id, [
                { "property": "last_login", "value": Number(moment().utc().startOf("date").format("x")) }
              ]));
              dispatch(logEvent("login", storedUser.payload));
              if (process.env.REACT_APP_STAGE === "production") hotjar.identify(storedUser.payload.cognito_id, { first_name: storedUser.payload.first_name, last_name: storedUser.payload.last_name, email: storedUser.payload.email });
              dispatch({ type: CLEAR_SIGNUP_STATE });
              dispatch({ type: IS_LOGGING_IN, payload: false });
              if (currentAccount && currentAccount.features && !Object.keys(currentAccount.features).length) dispatch(getAccountFeatures(currentAccount.account_id));
              if (!store.getState().customer_support.requestedCoreSettings && !store.getState().customer_support.isFetchingCoreSettings) dispatch(getCoreSettings(true));
              if (storedUser.success) {
                dispatch(getApplicationStatus());
                if (currentAccount) await loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token);
              }
              return { success: true, user: storedUser.payload };
            } else {
              dispatch({ type: CLEAR_SIGNUP_STATE });
              dispatch(logOut());
              dispatch({ type: IS_LOGGING_IN, payload: false });
              return { success: false, error: { message: storedUser.message } };
            }
          }
        })
        .catch((error) => {
          dispatch({ type: CLEAR_SIGNUP_STATE });
          dispatch({ type: HIDE_LOADER });
          dispatch({ type: IS_LOGGING_IN, payload: false });
          if (error.code === "UserNotConfirmedException") {
            return { success: true, user: { challengeName: "UserNotConfirmedException", email: (email).toLowerCase() } };
          } else if (error.code === "PasswordResetRequiredException") {
            return { success: true, user: { challengeName: "PasswordResetRequiredException" } };
          } else if (error.code === "NotAuthorizedException") {
            return { success: false, error };
          } else if (error.code === "UserNotFoundException") {
            return { success: false, error };
          } else {
            return { success: false, error };
          }
        });
      } else {
        return Auth.currentSession()
        .then(async (session) => {
          const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
          const newToken = session.idToken.jwtToken;
          dispatch(getCoreSettings(true));
          const storedUser = await API.get(apiGateway.NAME, `/users/${user.username}`, { headers: { Authorization: newToken } });
          if (storedUser.success) {
            let account_id = storedUser.payload.accounts.length ? store.getState().session.account_id : null;
            if (!account_id) {
              let currentAccount = storedUser.payload.primary_account;
              if (!currentAccount) currentAccount = storedUser.payload.accounts.find((a) => !a.linked_account);
              if (!currentAccount) currentAccount = storedUser.payload.accounts[0];
              if (!currentAccount) {
                dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                dispatch({ type: IS_LOGGING_IN, payload: false });
                dispatch(navigateTo("/account-registration", "?no_accounts=true"));
                dispatch({ type: HIDE_LOADER });
                return { success: false };
              }
              window.HubSpotConversations.widget.remove();
              account_id = currentAccount.account_id;
            }
            dispatch(updateUserStatus(storedUser.payload.cognito_id, true, false));
            dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token: newToken, user, primary_account_id: store.getState().session.primary_account_id || account_id } });
            dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
            dispatch(logEvent("refresh auth", storedUser.payload));
            dispatch({ type: CLEAR_SIGNUP_STATE });
            dispatch({ type: IS_LOGGING_IN, payload: false });
            if (storedUser.success) {
              dispatch(getApplicationStatus());
              if (account_id) await loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token);
            }
            return { success: true, user: storedUser.payload };
          } else {
            dispatch(logOut());
            dispatch({ type: IS_LOGGING_IN, payload: false });
            return { success: false, error: { message: storedUser.message } };
          }
        }).catch((error) => {
          if (!isPublicRoute(store.getState().router.location.pathname)) dispatch(logOut());
          dispatch({ type: IS_LOGGING_IN, payload: false });
          dispatch(getCoreSettings(true));
          if (error === "not authenticated" || (error.response && !error.response.data.success)) dispatch(logOut());
          return { success: false, error };
        });
    }
  } else {
    dispatch({ type: IS_LOGGING_IN, payload: false });
  }
};
const confirmSignIn = (user, code) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Verifying..." } });
  return Auth.confirmSignIn(user, code, "SMS_MFA")
  .then( async (user) => {
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Authorizing..." } });
    const token = user.signInUserSession.idToken.jwtToken;
    const storedUser = await API.get( apiGateway.NAME, `/users/${user.username}`, { headers: { Authorization: token } });
    if (process.env.REACT_APP_STAGE === "production") hotjar.identify(storedUser.payload.cognito_id, { first_name: storedUser.payload.first_name, last_name: storedUser.payload.last_name, email: storedUser.payload.email });
    let currentAccount = storedUser.payload.primary_account;
    await firebaseSignIn();
    dispatch(updateUserStatus(storedUser.payload.cognito_id, true, false, true));
    if (!currentAccount) currentAccount = storedUser.payload.accounts.find((a) => !a.linked_account);
    if (!currentAccount) currentAccount = storedUser.payload.accounts[0];
    if (!currentAccount) {
      dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
      dispatch({ type: IS_LOGGING_IN, payload: false });
      dispatch(navigateTo("/account-registration", "?no_accounts=true"));
      dispatch({ type: HIDE_LOADER });
      return { success: false };
    }
    window.HubSpotConversations.widget.remove();
    dispatch(createOrUpdateHubspotContact(storedUser.payload.hubspot_contact_id, [
      { "property": "last_login", "value": Number(moment().subtract(1, "day").utc().startOf("date").format("x")) },
      { "property": "last_session_url", "value": !process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost" || "localhost" }
    ]));
    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: currentAccount.account_id, token, user } });
    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
    dispatch({ type: IS_LOGGING_IN, payload: false });
    dispatch(navigateTo("/"));
    dispatch({ type: HIDE_LOADER });
    if (storedUser.success) {
      dispatch(getApplicationStatus());
      if (currentAccount) await loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token);
    }
    return { success: true };
  }).catch((error) => {
    if (!isPublicRoute(store.getState().router.location.pathname)) dispatch(logOut());
    dispatch({ type: IS_LOGGING_IN, payload: false });
    dispatch({ type: HIDE_LOADER });
    return { success: false, error };
  });
};

const forgotPassword = (email) => async (dispatch) => {
  if (email) {
    return API.get(apiGateway.NAME, "/users/forgot-password", { queryStringParameters: { email } }).then((reset) => {
      if (reset.success && reset.flow === "login") {
        dispatch(showNotification("success", "Temporary Password Sent", "We have reset your password, check your email for further instructions."));
        dispatch(navigateTo("/login", `?email=${email}`));
        return;
      } else if (reset.success && reset.flow === "forgot-password") {
        return Auth.forgotPassword((email).toLowerCase())
          .then((d) => {
            return { success: true };
          })
          .catch((error) => {
            return { success: false, message: error.message };
          });
      }
    }).catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
  } else {
    return { success: false, message: "You must provide an email to reset your password." };
  }
};

const confirmForgotPassword = (email, code, password, resetting, type) => async (dispatch) => {
  if (email && code && password) {
    return Auth.forgotPasswordSubmit((email).toLowerCase(), code, password)
    .then(() => {
      dispatch(navigateTo("/login", `?email=${email}`));
      if (resetting) dispatch({ type: SET_SESSION_ACCOUNT, payload: { is_resetting: resetting } });
      dispatch(showNotification("success", "Your password was reset!", "Please login with your new password."));
      return { success: true };
    })
    .catch((error) => {
      return { success: false, error };
    });
  } else {
    return { success: false, error: { message: "You must provide an email, verification code, and password to confirm." } };
  }
};

const completeNewPassword = (user, newPassword) => async (dispatch) => {
  if (user && newPassword) {
    return Auth.completeNewPassword(user, newPassword)
    .then(async (user) => {
      const token = user.signInUserSession.idToken.jwtToken;
      const storedUser = await API.get( apiGateway.NAME, `/users/${user.username}`, { headers: { Authorization: token } });
      if (storedUser.success && storedUser.payload.accounts.length) {
        const updatedMembership = await API.patch(
          apiGateway.NAME,
          `/membership/update/${storedUser.payload.accounts[0].account_id}/${storedUser.payload.cognito_id}`,
          {
            headers: {
              Authorization: token || store.getState().session.token
            },
            body: {
              updates: { status: "active", notified: true }
            }
          });
        if (updatedMembership.success) {
          let currentAccount = storedUser.payload.primary_account;
          if (!currentAccount) currentAccount = storedUser.payload.accounts.find((a) => !a.linked_account);
          if (!currentAccount) currentAccount = storedUser.payload.accounts[0];
          if (!currentAccount) {
            dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
            dispatch({ type: IS_LOGGING_IN, payload: false });
            dispatch(navigateTo("/account-registration", "?no_accounts=true"));
            dispatch({ type: HIDE_LOADER });
            return { success: false };
          }
          window.HubSpotConversations.widget.remove();
          dispatch(createOrUpdateHubspotContact(storedUser.payload.hubspot_contact_id, [
            { "property": "last_login", "value": Number(moment().subtract(1, "day").utc().startOf("date").format("x")) },
            { "property": "last_session_url", "value": !process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost" || "localhost" }
          ]));
          dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: updatedMembership.payload.account_id, token, user } });
          dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
          dispatch({ type: IS_LOGGING_IN, payload: false });
          dispatch(navigateTo("/"));
          dispatch(logEvent("password reset", storedUser.payload));
          if (storedUser.success) {
            dispatch(getApplicationStatus());
            if (currentAccount) await loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token);
          }
          return { success: true };
        } else {
          return { success: false, error: { message: updatedMembership.message } };
        }
      } else if (!storedUser.payload.accounts.length) {
        dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
        dispatch({ type: IS_LOGGING_IN, payload: false });
        dispatch(navigateTo("/account-registration", "?no_accounts=true"));
        dispatch({ type: HIDE_LOADER });
        return { success: true, error: { message: "Could not find an account for this user." } };
      } else {
        return { success: false, error: { message: storedUser.message } };
      }
    })
    .catch((error) => {
      return { success: false, error };
    });
  } else {
    return { success: false, error: { message: "You must provide an email, verification code, and password to confirm." } };
  }
};

const verifyAttribute = (attribute) => async (dispatch) => {
  return Auth.verifyCurrentUserAttribute(attribute)
  .then(() => {
    return { success: true };
  }).catch((error) => {
    return { success: false, error };
  });
};

const confirmAttributeVerification = (attribute, code) => async (dispatch) => {
  return Auth.verifyCurrentUserAttributeSubmit(attribute, code)
  .then((data) => {
    if (data === "SUCCESS") {
      const state = store.getState();
      return Auth.currentAuthenticatedUser({ bypassCache: true })
      .then(async (cognito) => {
        const storedUser = await API.get( apiGateway.NAME, `/users/${state.user.cognito_id}`, { headers: { Authorization: state.session.token } });
        const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
        LogRocket.track(`${attribute} verified for ${storedUser.payload.first_name} ${storedUser.payload.last_name} - ${storedUser.payload.email}.`);
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: state.session.account_id, token: state.session.token, user: currentUser } });
        dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
        dispatch(logEvent(`${attribute} verified`, storedUser.payload));
        return { success: true };
      }).catch((error) => {
        return { success: false, error };
      });
    }
  }).catch((error) => {
    return { success: false, error };
  });
};

const updateUserAttribute = (attribute, value) => async (dispatch) => {
  const state = store.getState();
  if (state.session.user) {
    if (attribute && value) {
      const result = await Auth.updateUserAttributes(state.session.user, {
        [attribute]: attribute === "email" ? (value).toLowerCase() : value
      });
      if (result === "SUCCESS") {
        const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: state.session.account_id, token: state.session.token, user } });
        dispatch(logEvent(`${attribute} updated`, state.user));
        return { success: true };
      } else {
        return { success: false, error: { message: "Could not update user attribute" } };
      }
    } else {
      return { success: false, error: { message: "You must enter a value to update." } };
    }
  } else {
    return { success: false, error: { message: "Something went wrong." } };
  }
};

const setupMFA = () => async (dispatch) => {
  const state = store.getState();
  const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
  return Auth.setPreferredMFA(user, "SMS").then(async () => {
    const storedUser = await API.get( apiGateway.NAME, `/users/${state.user.cognito_id}`, { headers: { Authorization: state.session.token } });
    const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: state.session.account_id, token: state.session.token, user: currentUser } });
    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
    dispatch(logEvent("mfa activated", state.user));
    return { success: true };
  }).catch((error) => {
    return { success: false, error };
  });
};

const resetMFA = () => async (dispatch) => {
  const state = store.getState();
  const disabled = await API.get(
    apiGateway.NAME,
    `/users/reset-user-mfa/${state.session.account_id}/${state.user.cognito_id}/${state.session.user.signInUserSession.accessToken.jwtToken}`,
    {
      headers: {
        Authorization: state.session.token
      }
    });
  if (disabled.success) {
    const storedUser = await API.get( apiGateway.NAME, `/users/${state.user.cognito_id}`, { headers: { Authorization: state.session.token } });
    const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: state.session.account_id, token: state.session.token, user: currentUser } });
    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
    dispatch(logEvent("mfa turned off", state.user));
    return { success: true };
  } else {
    return { success: false, error: { message: disabled.message } };
  }
};

const refreshUser = () => async (dispatch) => {
  Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user) => {
      const session = await Auth.currentSession();
      dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: store.getState().session.account_id, token: session.idToken.jwtToken, user } });
    })
    .catch(() => {
      dispatch(logOut());
    });
};

const cancelJoinRequest = (cognito_id, account_id) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Removing..." } });
  return API.post(
    apiGateway.NAME,
    `/accounts/cancel-join-request/${cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        cognito_id,
        account_id
      }
    }).then((cancel) => {
      if (cancel.success) {
        dispatch(login()).then(() => {
          dispatch({ type: HIDE_NOTIFICATION });
          dispatch(navigateTo("/", "?unjoin=true"));
          dispatch({ type: HIDE_LOADER });
        });
      }
      return { success: cancel.success };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

const authentication = {
  logOut,
  login,
  confirmSignIn,
  forgotPassword,
  confirmForgotPassword,
  completeNewPassword,
  verifyAttribute,
  confirmAttributeVerification,
  updateUserAttribute,
  setupMFA,
  resetMFA,
  refreshUser,
  updateUserStatus,
  cancelJoinRequest
};
export default authentication;
