import { SHOW_NOTIFICATION, HIDE_NOTIFICATION, SHOW_LOADER, HIDE_LOADER } from "./constants";
import { dispatchRequest } from "./request";
import { toastr } from "react-redux-toastr";
import { store } from "..";

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

export const showBannerNotification = (config, body) => async (dispatch) => {
  dispatch({ type: SHOW_NOTIFICATION, payload: { config, body } });
};
export const hideBannerNotification = () => async (dispatch) => {
  dispatch({ type: HIDE_NOTIFICATION });
};

export const runCustomAction = (action, body) => async (dispatch) => {
  switch (action) {
    case "PERMISSIONS_REQUEST":
      dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Sending..." } });
      for (let i = 0; i < body.permissions.length; i++) {
        await dispatch(dispatchRequest({
          title: "Permission request",
          request_type: "permission",
          priority: "low",
          body: `${store.getState().user.first_name} ${store.getState().user.last_name} is requesting "${body.permissions[i]}" permission.`,
          permission: body.permissions[i],
          permission_status: "pending"
        }));
      }
      dispatch({ type: HIDE_LOADER });
      break;
    default:
      break;
  }
};