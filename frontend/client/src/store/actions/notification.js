import { toastr } from "react-redux-toastr";
import { OPEN_TICKET_MODAL, SHOW_NOTIFICATION, HIDE_NOTIFICATION } from "./constants";
import { switchAccounts } from "./account";
import { store } from "..";
import { navigateTo } from "./navigation";
import { openHubspotChat } from "./hubspot";

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
    case "new_comment":
      const clickOptions = {
        onToastrClick: () => dispatch({ type: OPEN_TICKET_MODAL, payload: metadata }),
      };
      toastr.info(title, message, { status: "info", ...clickOptions});
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

export const runCustomAction = (action) => async (dispatch) => {
  const accounts = store.getState().accounts;
  const initial_account = accounts.find((account) => account.account_id === store.getState().session.primary_account_id);
  const primary_account = accounts.find((a) => a.is_primary);
  switch (action) {
    case "BACK_TO_CORE_ACCOUNT":
      dispatch(switchAccounts((primary_account || initial_account), false));
      break;
    case "UPGRADE_PLAN":
      dispatch(navigateTo("/settings", "?tab=subscription"));
      break;
    case "OPEN_LIVE_CHAT":
      dispatch(openHubspotChat());
      break;
    default:
      break;
  }
};