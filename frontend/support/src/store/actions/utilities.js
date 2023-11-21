import { navigateTo } from "./navigation";
import { toastr } from "react-redux-toastr";
import { showNotification } from "./notification";
import config from "../../config";
import axios from "axios";
import LogRocket from "logrocket";
import { store } from "..";
import {
  IS_ACTIVE,
  IS_IDLE,
  // USER_DID_ACTION,
  UPDATE_APPLICATION_STATUS
} from "./constants";

export const isIdle = (e, seconds = 60, message = "") => async (dispatch) => {
  dispatch({ type: IS_IDLE, payload: { seconds, idle_message: message } });
};

export const isActive = (e) => async (dispatch) => {
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
      appVersion: store.getState().customer_support.core_settings.support_app_version,
      environment: process.env.REACT_APP_STAGE,
      first_name: user.first_name,
      last_name: user.last_name,
      application: "customer-support",
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
  const application = await axios.get("https://lsfjfc30yhxc.statuspage.io/api/v2/status.json");
  if (application.status === 200) dispatch({ type: UPDATE_APPLICATION_STATUS, payload: application.data.status });
};

export const logEvent = (type, user = store.getState().user) => async (dispatch) => {
  let logrocket_config = { last_event: type };
  if (user) {
    logrocket_config.name = `${user.first_name} ${user.last_name}`;
    logrocket_config.email = user.email;
    if (user.hubspot_contact_id) logrocket_config.hubspot_contact_id = user.hubspot_contact_id;
    LogRocket.identify(user.cognito_id, logrocket_config);
  }
  LogRocket.track(type, logrocket_config);
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

export const copyToClipboard = (text, type) => async (dispatch) => {
  let textField = document.createElement("textarea");
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand("copy");
  textField.remove();
  dispatch(showNotification("success", type ? `${type} copied!` : "Text Copied!", ""));
};