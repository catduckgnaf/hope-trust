import { Auth } from "aws-amplify";
import LogRocket from "logrocket";
import { isPublicRoute } from "../../utilities";
import { navigateTo } from "./navigation";
import { getCoreSettings } from "./customer-support";
import { loadHubspotGenericDefaults, loadHubspotDefaults } from "../../hubspot-config";
import { getAccountFeatures, getRelationships } from "./account";
import { createOrUpdateHubspotContact, getHubspotVisitorToken } from "./hubspot";
import { store } from "..";
import { logEvent, getSurveyStatus } from "./utilities";
import { hotjar } from "react-hotjar";
import moment from "moment";
import { CHANGE_FORM_SLIDE, UPDATE_LOGIN, SET_SESSION_ACCOUNT, UPDATE_SESSION, CLEAR_SIGNUP_STATE, IS_LOGGED_OUT, IS_LOGGED_IN, SHOW_LOADER, HIDE_LOADER, IS_LOGGING_IN, CLEAR_ALL, BULK_UPDATE_LOGIN, CLEAR_LOGIN, CLEAR_CLIENT_REGISTRATION, CLEAR_PARTNER_REGISTRATION } from "./constants";
import firebase_app from "../../firebase";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getCurrentUser, updateUserStatus } from "./user";
import { getAccounts } from "./account";
import { showNotification } from "./notification";
const auth = getAuth(firebase_app);

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
const login = (user) => async (dispatch) => {
  if (!store.getState().login.is_logging_in) {
    dispatch({ type: IS_LOGGING_IN, payload: true });
    if (user) {
      const { email, password } = user;
      if (!email || !password) {
        dispatch({ type: IS_LOGGING_IN, payload: false });
        return { success: false, error: { message: "You must enter an email and password." } };
      }
      return Auth.signIn({ username: (email).toLowerCase(), password })
        .then(async (loggedInUser) => {
          dispatch({ type: UPDATE_SESSION, payload: { account_id: loggedInUser.username } });
          if (loggedInUser.challengeName === "SMS_MFA") {
            return { success: true, user: loggedInUser, email };
          } else if (loggedInUser.challengeName === "NEW_PASSWORD_REQUIRED") {
            return { success: true, user: loggedInUser, email };
          } else {
            const token = loggedInUser.signInUserSession.idToken.jwtToken;
            dispatch({ type: UPDATE_SESSION, payload: { token, user: loggedInUser } });
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Authenticating..." } });
            dispatch(getCoreSettings(true));
            return dispatch(getAccounts(loggedInUser.username, loggedInUser.username, false, false))
            .then(async (accounts) => {
              let currentAccount = accounts.find((a) => a.is_primary);
              if (!currentAccount) currentAccount = accounts.find((a) => !a.linked_account);
              if (!currentAccount && accounts.length) currentAccount = accounts[0];
              return dispatch(getCurrentUser(loggedInUser.username, token, currentAccount?.account_id))
                .then(async (storedUser) => {
                  await firebaseSignIn();
                  dispatch(updateUserStatus(storedUser.payload.cognito_id, true, false, true));
                  if (!currentAccount) {
                    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                    dispatch({ type: IS_LOGGING_IN, payload: false });
                    dispatch(navigateTo("/account-registration", `?no_accounts=true&partner=${storedUser.payload.is_partner || false}`));
                    return { success: false, user: storedUser.payload };
                  }
                  return dispatch(getRelationships(true, storedUser.payload.cognito_id, currentAccount.account_id))
                  .then(async (response) => {
                    window.HubSpotConversations.widget.remove();
                    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: currentAccount.account_id, token, user: loggedInUser, primary_account_id: currentAccount.account_id } });
                    if (storedUser.payload.is_partner) {
                      if (currentAccount.subscription) dispatch(navigateTo("/accounts"));
                      else dispatch(navigateTo("/account-registration"));
                    }
                    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                    dispatch(createOrUpdateHubspotContact(storedUser.payload.hubspot_contact_id, [
                      { "property": "last_login", "value": Number(moment().utc().startOf("date").format("x")) }
                    ]));
                    dispatch(logEvent("login", storedUser.payload));
                    if (process.env.REACT_APP_STAGE === "production") hotjar.identify(storedUser.payload.cognito_id, { first_name: storedUser.payload.first_name, last_name: storedUser.payload.last_name, email: storedUser.payload.email });
                    dispatch({ type: CLEAR_SIGNUP_STATE });
                    dispatch({ type: CLEAR_LOGIN });
                    dispatch({ type: IS_LOGGING_IN, payload: false });
                    if (currentAccount && currentAccount.features && !Object.keys(currentAccount.features).length) dispatch(getAccountFeatures(currentAccount.account_id));
                    if (!store.getState().customer_support.requestedCoreSettings && !store.getState().customer_support.isFetchingCoreSettings) dispatch(getCoreSettings(true));
                    if (storedUser.success) {
                      dispatch(getSurveyStatus());
                      if (currentAccount) {
                        dispatch(getHubspotVisitorToken())
                        .then(async (visitor_token) => {
                          await loadHubspotDefaults(visitor_token);
                        });
                      }
                    }
                    return { success: true, user: storedUser.payload };
                  })
                  .catch((error) => {
                    dispatch({ type: CLEAR_LOGIN });
                    dispatch({ type: CLEAR_SIGNUP_STATE });
                    dispatch(logOut());
                    dispatch({ type: IS_LOGGING_IN, payload: false });
                    return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
                  });
                })
                .catch((error) => {
                  dispatch({ type: CLEAR_LOGIN });
                  dispatch({ type: CLEAR_SIGNUP_STATE });
                  dispatch(logOut());
                  dispatch({ type: IS_LOGGING_IN, payload: false });
                  return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
                });
            })
            .catch((error) => {
              dispatch(logOut());
              dispatch({ type: IS_LOGGING_IN, payload: false });
              return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
            });
          }
        })
        .catch((error) => {
          dispatch({ type: CLEAR_LOGIN });
          dispatch({ type: CLEAR_SIGNUP_STATE });
          dispatch({ type: HIDE_LOADER });
          dispatch({ type: IS_LOGGING_IN, payload: false });
          if (error.code === "UserNotConfirmedException") {
            return { success: true, user: { challengeName: "UserNotConfirmedException", email: (email).toLowerCase() } };
          } else if (error.code === "PasswordResetRequiredException") {
            return { success: true, user: { challengeName: "PasswordResetRequiredException", email: (email).toLowerCase() } };
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
          dispatch({ type: UPDATE_SESSION, payload: { token: newToken, user } });
          dispatch(getCoreSettings(true));
          return dispatch(getAccounts(user.username, store.getState().session.account_id, true))
          .then(async (accounts) => {
            return dispatch(getCurrentUser())
              .then(async (storedUser) => {
                let account_id = accounts.length ? store.getState().session.account_id : null;
                if (!account_id) {
                  let currentAccount = accounts.find((a) => a.is_primary);
                  if (!currentAccount) currentAccount = accounts.find((a) => !a.linked_account);
                  if (!currentAccount && accounts.length) currentAccount = accounts[0];
                  if (!currentAccount) {
                    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                    dispatch({ type: IS_LOGGING_IN, payload: false });
                    dispatch(navigateTo("/account-registration", `?no_accounts=true&partner=${storedUser.payload.is_partner || false}`));
                    return { success: false };
                  }
                  account_id = currentAccount?.account_id;
                }
                window.HubSpotConversations.widget.remove();
                dispatch(updateUserStatus(storedUser.payload.cognito_id, true, false));
                dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token: newToken, user, primary_account_id: store.getState().session.primary_account_id || account_id } });
                dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                dispatch(logEvent("refresh auth", storedUser.payload));
                dispatch({ type: CLEAR_LOGIN });
                dispatch({ type: CLEAR_SIGNUP_STATE });
                dispatch({ type: IS_LOGGING_IN, payload: false });
                if (storedUser.success) {
                  dispatch(getSurveyStatus());
                  if (account_id) await loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token);
                }
                return { success: true, user: storedUser.payload };
              })
              .catch((error) => {
                dispatch(logOut());
                dispatch({ type: IS_LOGGING_IN, payload: false });
                return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
              });
          })
          .catch((error) => {
            dispatch(logOut());
            dispatch({ type: IS_LOGGING_IN, payload: false });
            return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
          });
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
  .then(async (loggedInUser) => {
    const token = loggedInUser.signInUserSession.idToken.jwtToken;
    dispatch({ type: UPDATE_SESSION, payload: { token, user: loggedInUser } });
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Authenticating..." } });
    return dispatch(getAccounts(loggedInUser.username, loggedInUser.username, false, false))
      .then(async (accounts) => {
        let currentAccount = accounts.find((a) => a.is_primary);
        if (!currentAccount) currentAccount = accounts.find((a) => !a.linked_account);
        if (!currentAccount && accounts.length) currentAccount = accounts[0];
        return dispatch(getCurrentUser(loggedInUser.username, token, currentAccount?.account_id))
          .then(async (storedUser) => {
            await firebaseSignIn();
            dispatch(updateUserStatus(storedUser.payload.cognito_id, true, false, true));
            if (!currentAccount) {
              dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
              dispatch({ type: IS_LOGGING_IN, payload: false });
              dispatch(navigateTo("/account-registration", `?no_accounts=true&partner=${storedUser.payload.is_partner || false}`));
              return { success: false, user: storedUser.payload };
            }
            return dispatch(getRelationships(true, storedUser.payload.cognito_id, currentAccount.account_id))
              .then(async (response) => {
                window.HubSpotConversations.widget.remove();
                dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: currentAccount.account_id, token, user: loggedInUser, primary_account_id: currentAccount.account_id } });
                if (storedUser.payload.is_partner) {
                  if (currentAccount.subscription) dispatch(navigateTo("/accounts"));
                  else dispatch(navigateTo("/account-registration"));
                }
                dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                dispatch(createOrUpdateHubspotContact(storedUser.payload.hubspot_contact_id, [
                  { "property": "last_login", "value": Number(moment().utc().startOf("date").format("x")) }
                ]));
                dispatch(logEvent("login", storedUser.payload));
                if (process.env.REACT_APP_STAGE === "production") hotjar.identify(storedUser.payload.cognito_id, { first_name: storedUser.payload.first_name, last_name: storedUser.payload.last_name, email: storedUser.payload.email });
                dispatch({ type: CLEAR_LOGIN });
                dispatch({ type: CLEAR_SIGNUP_STATE });
                dispatch({ type: IS_LOGGING_IN, payload: false });
                if (currentAccount && currentAccount.features && !Object.keys(currentAccount.features).length) dispatch(getAccountFeatures(currentAccount.account_id));
                if (!store.getState().customer_support.requestedCoreSettings && !store.getState().customer_support.isFetchingCoreSettings) dispatch(getCoreSettings(true));
                if (storedUser.success) {
                  dispatch(getSurveyStatus());
                  if (currentAccount) await loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token);
                }
                return { success: true, user: storedUser.payload };
              })
              .catch((error) => {
                dispatch({ type: CLEAR_LOGIN });
                dispatch({ type: CLEAR_SIGNUP_STATE });
                dispatch(logOut());
                dispatch({ type: IS_LOGGING_IN, payload: false });
                return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
              });
          })
          .catch((error) => {
            dispatch({ type: CLEAR_LOGIN });
            dispatch({ type: CLEAR_SIGNUP_STATE });
            dispatch(logOut());
            dispatch({ type: IS_LOGGING_IN, payload: false });
            return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
          });
      })
      .catch((error) => {
        dispatch(logOut());
        dispatch({ type: IS_LOGGING_IN, payload: false });
        return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
      });
  }).catch((error) => {
    if (!isPublicRoute(store.getState().router.location.pathname)) dispatch(logOut());
    dispatch({ type: IS_LOGGING_IN, payload: false });
    dispatch({ type: HIDE_LOADER });
    return { success: false, error };
  });
};

const completeNewPassword = (user, newPassword, email) => async (dispatch) => {
  if (user && newPassword) {
    return Auth.completeNewPassword(user, newPassword)
      .then((loggedInUser) => {
      dispatch({ type: UPDATE_SESSION, payload: { account_id: loggedInUser.username } });
      if (loggedInUser.challengeName === "SMS_MFA") {
        return { success: true, user: loggedInUser, email };
      } else if (loggedInUser.challengeName === "NEW_PASSWORD_REQUIRED") {
        return { success: true, user: loggedInUser, email };
      } else {
        const token = loggedInUser.signInUserSession.idToken.jwtToken;
        dispatch({ type: UPDATE_SESSION, payload: { token, user: loggedInUser } });
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Authenticating..." } });
        return dispatch(getAccounts(loggedInUser.username, loggedInUser.username, false, false))
          .then(async (accounts) => {
            let currentAccount = accounts.find((a) => a.is_primary);
            if (!currentAccount) currentAccount = accounts.find((a) => !a.linked_account);
            if (!currentAccount && accounts.length) currentAccount = accounts[0];
            return dispatch(getCurrentUser(loggedInUser.username, token, currentAccount?.account_id))
              .then(async (storedUser) => {
                await firebaseSignIn();
                dispatch(updateUserStatus(storedUser.payload.cognito_id, true, false, true));
                if (!currentAccount) {
                  dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                  dispatch({ type: IS_LOGGING_IN, payload: false });
                  dispatch(navigateTo("/account-registration", `?no_accounts=true&partner=${storedUser.payload.is_partner || false}`));
                  return { success: false, user: storedUser.payload };
                }
                return dispatch(getRelationships(true, storedUser.payload.cognito_id, currentAccount.account_id))
                  .then(async (response) => {
                    window.HubSpotConversations.widget.remove();
                    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: currentAccount.account_id, token, user: loggedInUser, primary_account_id: currentAccount.account_id, is_resetting: false } });
                    if (storedUser.payload.is_partner) {
                      if (currentAccount.subscription) dispatch(navigateTo("/accounts"));
                      else dispatch(navigateTo("/account-registration"));
                    }
                    dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                    dispatch(createOrUpdateHubspotContact(storedUser.payload.hubspot_contact_id, [
                      { "property": "last_login", "value": Number(moment().utc().startOf("date").format("x")) }
                    ]));
                    dispatch(logEvent("login", storedUser.payload));
                    if (process.env.REACT_APP_STAGE === "production") hotjar.identify(storedUser.payload.cognito_id, { first_name: storedUser.payload.first_name, last_name: storedUser.payload.last_name, email: storedUser.payload.email });
                    dispatch({ type: CLEAR_SIGNUP_STATE });
                    dispatch({ type: CLEAR_LOGIN });
                    dispatch({ type: IS_LOGGING_IN, payload: false });
                    if (currentAccount && currentAccount.features && !Object.keys(currentAccount.features).length) dispatch(getAccountFeatures(currentAccount.account_id));
                    if (!store.getState().customer_support.requestedCoreSettings && !store.getState().customer_support.isFetchingCoreSettings) dispatch(getCoreSettings(true));
                    if (storedUser.success) {
                      dispatch(getSurveyStatus());
                      if (currentAccount) await loadHubspotDefaults(store.getState().session.zendesk.hubspot_visitor_token);
                    }
                    return { success: true, user: storedUser.payload };
                  })
                  .catch((error) => {
                    dispatch({ type: CLEAR_LOGIN });
                    dispatch({ type: CLEAR_SIGNUP_STATE });
                    dispatch(logOut());
                    dispatch({ type: IS_LOGGING_IN, payload: false });
                    return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
                  });
              })
              .catch((error) => {
                dispatch({ type: CLEAR_LOGIN });
                dispatch({ type: CLEAR_SIGNUP_STATE });
                dispatch(logOut());
                dispatch({ type: IS_LOGGING_IN, payload: false });
                return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
              });
          })
          .catch((error) => {
            dispatch(logOut());
            dispatch({ type: IS_LOGGING_IN, payload: false });
            return { success: false, error: { message: error.response && error.response.data ? error.response.data.message : "Something went wrong." } };
          });
      }
    })
    .catch((error) => {
      dispatch({ type: CLEAR_LOGIN });
      dispatch({ type: CLEAR_SIGNUP_STATE });
      dispatch({ type: HIDE_LOADER });
      dispatch({ type: IS_LOGGING_IN, payload: false });
      if (error.code === "UserNotConfirmedException") {
        return { success: true, user: { challengeName: "UserNotConfirmedException", email: (email).toLowerCase() } };
      } else if (error.code === "PasswordResetRequiredException") {
        return { success: true, user: { challengeName: "PasswordResetRequiredException", email: (email).toLowerCase() } };
      } else if (error.code === "NotAuthorizedException") {
        return { success: false, error };
      } else if (error.code === "UserNotFoundException") {
        return { success: false, error };
      } else {
        return { success: false, error };
      }
    });
  } else {
    dispatch(showNotification("error", "Reset Error", "You must provide an email, verification code, and password to confirm."));
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
        return dispatch(getCurrentUser(state.user.cognito_id, state.session.token))
        .then(async (storedUser) => {
          const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
          LogRocket.track(`${attribute} verified for ${storedUser.payload.first_name} ${storedUser.payload.last_name} - ${storedUser.payload.email}.`);
          dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: state.session.account_id, token: state.session.token, user: currentUser } });
          dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
          dispatch(logEvent(`${attribute} verified`, storedUser.payload));
          return { success: true };
        })
        .catch((error) => {
          return { success: false, error };
        });
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

const updateLogin = (collector, key, value) => (dispatch) => {
  dispatch({ type: UPDATE_LOGIN, payload: { collector, key, value } });
};

const bulkUpdateLogin = (collector, data) => (dispatch) => {
  dispatch({ type: BULK_UPDATE_LOGIN, payload: { collector, data } });
};

const clearLogin = () => (dispatch) => {
  dispatch({ type: CLEAR_LOGIN });
  dispatch({ type: CHANGE_FORM_SLIDE, payload: 0 });
};

const setFlow = (flow, clear = true) => (dispatch) => {
  if (clear) {
    dispatch({ type: CLEAR_LOGIN });
    dispatch({ type: CHANGE_FORM_SLIDE, payload: 0 });
  }
  dispatch({ type: UPDATE_LOGIN, payload: { collector: "", key: "flow", value: flow } });
};

const clearRegistrations = () => (dispatch) => {
  dispatch({ type: CLEAR_LOGIN });
  dispatch({ type: CLEAR_CLIENT_REGISTRATION });
  dispatch({ type: CLEAR_PARTNER_REGISTRATION });
  dispatch({ type: CHANGE_FORM_SLIDE, payload: 0 });
};



const authentication = {
  clearRegistrations,
  updateLogin,
  bulkUpdateLogin,
  clearLogin,
  setFlow,
  logOut,
  login,
  confirmSignIn,
  completeNewPassword,
  verifyAttribute,
  confirmAttributeVerification,
  updateUserAttribute
};

export default authentication;