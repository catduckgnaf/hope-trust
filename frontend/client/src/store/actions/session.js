import { sleep } from "../../utilities";
import {
  UPDATE_SESSION,
  UPDATE_ZENDESK_STATE,
  OPEN_INSTALL_PROMPT_MODAL,
  CLOSE_INSTALL_PROMPT_MODAL,
  SHOW_LOADER,
  CLEAR_ALL,
  UPDATE_APP_VERSION,
  HIDE_LOADER
} from "./constants";
import { showNotification } from "./notification";

export const updateSession = (id, value) => async (dispatch) => {
  dispatch({ type: UPDATE_SESSION, payload: { [id]: value } });
};

export const updateZendeskState = (id, value) => async (dispatch) => {
  dispatch({ type: UPDATE_ZENDESK_STATE, payload: { [id]: value } });
};

export const closeInstalliOSWebAppModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_INSTALL_PROMPT_MODAL });
};

export const openInstalliOSWebAppModal = () => async (dispatch) => {
  dispatch({ type: OPEN_INSTALL_PROMPT_MODAL });
};

export const clearAll = () => async (dispatch) => {
  dispatch({ type: CLEAR_ALL });
};

export const updateAppVersion = () => async (dispatch) => {
  navigator.serviceWorker.ready
  .then(async (worker) => {
    console.log("Service worker ready for update.");
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Updating..." } });
    await sleep(2000);
    if (worker && worker.waiting) {
      console.log("Updating..");
      worker.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      console.log("Application is already up to date.");
      dispatch({ type: UPDATE_APP_VERSION });
      dispatch(showNotification("success", "Application Updated", "Great! You are now running the latest version of Hope Trust. Reloading..."));
      dispatch({ type: HIDE_LOADER });
    }
  });
};