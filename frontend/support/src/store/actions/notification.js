import { toastr } from "react-redux-toastr";
import { store } from "..";
import { OPEN_PUSH_NOTIFICATION_MODAL, CLOSE_PUSH_NOTIFICATION_MODAL, SHOW_NOTIFICATION, HIDE_NOTIFICATION } from "./constants";
import firebase from "../../firebase";
import { getDatabase, ref, child, push, set } from "firebase/database";
const db = getDatabase(firebase);

export const showNotification = (type, title, message, metadata) => async (dispatch) => {
  const config = { status: type };
  if (metadata && metadata.action) config.onToastrClick = () => dispatch(metadata.action);
  switch(type) {
    case "success":
      toastr.success(title, message, config);
      break;
    case "info":
      toastr.info(title, message, config);
      break;
    case "warning":
      toastr.warning(title, message, config);
      break;
    case "error":
      toastr.error(title, message, config);
      break;
    case "delete":
      const deleteOptions = {
        onOk: () => dispatch(metadata.action),
        onCancel: () => toastr.removeByType("confirms"),
        okText: "Delete",
        cancelText: "Cancel"
      };
      toastr.confirm(title, deleteOptions);
      break;
    case "confirm":
      const confirmOptions = {
        onOk: () => dispatch(metadata.action),
        onCancel: () => toastr.removeByType("confirms"),
        okText: "Yes",
        cancelText: "No"
      };
      toastr.confirm(title, confirmOptions);
      break;
    default:
      break;
  }
};

export const showBannerNotification = (config) => async (dispatch) => {
  dispatch({ type: SHOW_NOTIFICATION, payload: config });
};
export const hideBannerNotification = (config) => async (dispatch) => {
  dispatch({ type: HIDE_NOTIFICATION, payload: config });
};

export const createPush = (push_config, users, omit_name) => async (dispatch) => {
  let success = [];
  for(let i = 0; i < users.length; i++) {
    const user = users[i];
    const push_key = push(child(ref(db), `push/${process.env.REACT_APP_STAGE || "development"}/${user.value}`)).key;
    const push_ref = ref(db, `push/${process.env.REACT_APP_STAGE || "development"}/${user.value}/${push_key}`);
    await set(push_ref, { ...push_config, read: false, created_at: Date.now(), by: omit_name ? "" : `${store.getState().user.first_name} ${store.getState().user.last_name}`, sent_by: store.getState().user.cognito_id });
    success.push(i);
  }
  if (success.length === users.length) {
    dispatch(showNotification("success", (success.length === 1 ? "Notification Sent" : "Notifications Sent"), `Push notification successfully sent to ${success.length} ${success.length === 1 ? "user" : "users"}`));
    return { success: true };
  } else if (success.length) {
    const diff = (users.length - success.length);
    dispatch(showNotification("error", (diff.length === 1 ? "Notification Failure" : "Notifications Failures"), `Failed to send ${diff} push notifications`));
  }
  return { success: false };
};

export const openPushNotificationModal = (online) => async (dispatch) => {
  dispatch({ type: OPEN_PUSH_NOTIFICATION_MODAL, payload: online });
};

export const closePushNotificationModal = (online) => async (dispatch) => {
  dispatch({ type: CLOSE_PUSH_NOTIFICATION_MODAL, payload: online });
};

export const runCustomAction = (action) => async (dispatch) => {
  switch (action) {
    default:
      break;
  }
};