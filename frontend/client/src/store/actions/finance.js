import {
  SET_ACTIVE_FINANCE_TAB
} from "./constants";
import { store } from "..";
import { logEvent } from "./utilities";

export const setActiveFinanceTab = (tab) => async (dispatch) => {
  dispatch({ type: SET_ACTIVE_FINANCE_TAB, payload: tab });
  dispatch(logEvent("finance tab switched", store.getState().user));
};