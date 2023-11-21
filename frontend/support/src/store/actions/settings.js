import { CHANGE_SETTINGS_TAB } from "./constants";

export const changeSettingsTab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_SETTINGS_TAB, payload: tab });
};