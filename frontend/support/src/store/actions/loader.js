import { SHOW_LOADER, HIDE_LOADER } from "./constants";

export const showLoader = (message) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message } });
};

export const hideLoader = () => async (dispatch) => {
  setTimeout(() => {
    dispatch({ type: HIDE_LOADER });
  }, 1000);
};
