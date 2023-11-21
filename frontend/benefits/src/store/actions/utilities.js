import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { navigateTo } from "./navigation";
import { toastr } from "react-redux-toastr";
import { showNotification } from "./notification";
import { updateHubspotContact } from "./user";
import config from "../../config";
import axios from "axios";
import { store } from "..";
import ReactGA from "react-ga";
import { sortBy, uniqBy } from "lodash";
import authentication from "./authentication";
import {
  IS_ACTIVE,
  IS_IDLE,
  // USER_DID_ACTION,
  UPDATE_APPLICATION_STATUS,
  CHANGE_FORM_SLIDE,
  UPDATE_CLIENT_REGISTRATION,
  HIDE_LOADER,
  SHOW_LOADER,
  IS_FETCHING_ALL,
  HAS_FETCHED_ALL
} from "./constants";

export const isIdle = (e, seconds = 60, message = "") => async (dispatch) => {
  dispatch(authentication.updateUserStatus(store.getState().user.cognito_id, true, true));
  dispatch({ type: IS_IDLE, payload: { seconds, idle_message: message } });
};

export const isActive = (e) => async (dispatch) => {
  dispatch(authentication.updateUserStatus(store.getState().user.cognito_id, true));
  dispatch({ type: IS_ACTIVE });
};

export const onAction = (e) => async (dispatch) => {
   // dispatch({ type: USER_DID_ACTION });
};

export const injectUserSnap = (user, session) => async (dispatch) => {
  const snap_config = {
    user: {
      userId: user.cognito_id,
      email: user.email,
    },
    custom: {
      account: session.account_id,
      appVersion: store.getState().customer_support.core_settings.benefits_app_version,
      environment: process.env.REACT_APP_STAGE,
      first_name: user.first_name,
      last_name: user.last_name,
      application: "benefits",
      logrocket_url: LogRocket.sessionURL
    }
  };
  window.onUsersnapLoad = (api) => {
    api.init(snap_config);
    window.Usersnap = api;
  };
  const newScript = document.createElement("script");
  newScript.id = "usersnap-embed-script";
  newScript.type = "text/javascript";
  newScript.async = true;
  newScript.defer = 1;
  newScript.src = `https://widget.usersnap.com/global/load/${config.usersnap.USERSNAP_API_KEY}?onload=onUsersnapLoad`;
  const existingScripts = document.getElementsByTagName("script")[0];
  existingScripts.parentNode.insertBefore(newScript, existingScripts);
};

export const getApplicationStatus = () => async (dispatch) => {
  const application = await axios.get("https://lsfjfc30yhxc.statuspage.io/api/v2/summary.json");
  if (application.status === 200) dispatch({ type: UPDATE_APPLICATION_STATUS, payload: application.data });
};

export const logEvent = (type, user = store.getState().user, element = "", label = "") => async (dispatch) => {
  let logrocket_config = { last_event: type };
  if (user) {
    const account = user && user.accounts ? user.accounts.find((account) => account.account_id === store.getState().session.account_id) : {};
    logrocket_config.name = `${user.first_name} ${user.last_name}`;
    logrocket_config.email = user.email;
    if (user.zendesk_user_id) logrocket_config.zendesk_user_id = user.zendesk_user_id;
    if (account) logrocket_config.plan_id = account.plan_id;
    LogRocket.identify(user.cognito_id, logrocket_config);
  }
  if (!["modal"].includes(element)) ReactGA.event({ category: "Application Events", action: type, label: label || (!process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost") });
  if (["modal"].includes(element)) ReactGA.modalview(type);
  if (["login", "refresh auth"].includes(type) && user) ReactGA.set({ userId: user.cognito_id, appName: config.system.name, appVersion: String(store.getState().customer_support.core_settings.app_version) });
  if (!user) ReactGA.event({ category: "Visitor Events", action: type, label: label || (!process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost") });
  LogRocket.track(type, logrocket_config);
  dispatch(updateHubspotContact(user.hubspot_contact_id, [
    { "property": "last_action", "value": type },
    { "property": "last_session_url", "value": !process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost" }
  ]));
};

export const claimThisEmail = (email) => async (dispatch) => {
  const claimOptions = {
    onOk: () => dispatch(navigateTo("/login", `?email=${email}`)),
    onCancel: () => toastr.removeByType("confirms"),
    okText: "Login",
    cancelText: "Cancel",
    buttons: [
      { text: "Reset Password", handler: () => {
        dispatch(navigateTo("/forgot-password", `?email=${email}&resetting=true`));
      }},
      { cancel: true }
    ]
  };
  toastr.confirm("Users may not reuse their email address to signup for multiple Hope Trust accounts. If you want to create additional accounts, please login and navigate to your Accounts page.\n\nChoose one of the below options if you would like to access this account.", claimOptions);
};

export const verifyDiscount = (code) => async (dispatch) => {
  if (code) {
    return API.post(apiGateway.NAME, "/stripe/verify-discount-code", { body: { code } })
      .then((coupon) => {
        if (coupon.success) {
          LogRocket.track(`Discount verified. - ${coupon.payload.id}`);
          return coupon.payload;
        } else {
          dispatch(showNotification("error", "Discount Code", coupon.message));
        }
      })
      .catch((error) => {
        dispatch(showNotification("error", "Discount Verification", error.response.data.message));
        return false;
      });
  } else {
    dispatch(showNotification("error", "Discount Verification", "You must enter a discount code."));
    return false;
  }
};

export const copyToClipboard = (text, type) => async (dispatch) => {
  let textField = document.createElement("textarea");
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand("copy");
  textField.remove();
  dispatch(showNotification("success", type ? `${type} copied!` : "Text Copied!", ""));
};

export const resendSignUp = (email) => async (dispatch) => {
  if (email) {
    email = email.toLowerCase().replace(/\s+/g, "");
    return Auth.resendSignUp((email).toLowerCase())
      .then((data) => {
        LogRocket.track(`Verification code resent to ${email}`);
        dispatch(showNotification("success", "Verification Code Sent", `A new verification code was sent to ${email}`));
        return { success: true };
      })
      .catch((error) => {
        dispatch(showNotification("error", "Resend Verification Code", error.message));
        return { success: false };
      });
  } else {
    dispatch(showNotification("error", "Resend Verification Code", "You must enter an email to resend a verification code."));
    return { success: false };
  }
};

export const cancelSignup = (email, restart = false) => async (dispatch) => {
  if (email) {
    email = email.toLowerCase().replace(/\s+/g, "");
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Cancelling..." } });
    return API.get(apiGateway.NAME, `/users/cancel-signup/${email}`).then((user) => {
      dispatch({ type: HIDE_LOADER });
      dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "is_verifying", value: false } });
      dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "verification_code", value: "" } });
      if (restart) {
        dispatch({ type: CHANGE_FORM_SLIDE, payload: 0 });
      } else {
        dispatch({ type: CHANGE_FORM_SLIDE, payload: store.getState().multi_part_form.slide - 1 });
      }
      return user;
    }).catch((error) => {
      dispatch({ type: HIDE_LOADER });
      if (error.response) return error.response.data;
      return { success: false };
    });
  }
};

export const runPromisesInSequence = (lists, override = false) => async (dispatch) => {
    if (override) {
      dispatch({ type: IS_FETCHING_ALL });
      lists = sortBy(lists, "order");
      const promises = lists.map((list) => () => list.action(override));
      return promises.reduce(
        (before, after) => before.then((_) => after()),
        Promise.resolve()
      );
    }
  };

export const hasFetchedAll = () => async (dispatch) => {
  dispatch({ type: HAS_FETCHED_ALL });
};

export const countOrganizations = (orgs) => {
  return uniqBy(orgs, "name").length;
};

export const countActiveClients = (clients) => {
  return clients.length;
};

export const sumRevenue = (clients) => {
  return `$${clients.reduce((a, { account_value }) => a + account_value, 0).toLocaleString()}`;
};

export const retrieveReduxState = (key) => {
  return store.getState()[key];
};