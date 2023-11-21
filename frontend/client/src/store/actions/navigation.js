import { push } from "connected-react-router";
import { Auth } from "aws-amplify";
import { hotjar } from "react-hotjar";
import { store } from "..";
import { TOGGLE_MOBILE_NAVIGATION_MENU, SET_SESSION_ACCOUNT, CLEAR_ALL } from "./constants";
const _hsq = window._hsq = window._hsq || [];

export const navigateTo = (location, query, anchor) => async (dispatch) => {
  if (store.getState().user) {
    Auth.currentAuthenticatedUser({ bypassCache: true })
      .then(async (user) => {
        const session = await Auth.currentSession();
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: store.getState().session.account_id, token: session.idToken.jwtToken, user } });
        if (process.env.REACT_APP_STAGE === "production") hotjar.stateChange(location);
        _hsq.push(["setPath", location]);
        _hsq.push(["trackPageView"]);
        dispatch(push({ pathname: location, search: query }));
        if (anchor && document.querySelector(anchor)) document.querySelector(anchor).scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(() => {
        dispatch({ type: CLEAR_ALL });
        dispatch(push({ pathname: "/login", search: query }));
        if (anchor && document.querySelector(anchor)) document.querySelector(anchor).scrollIntoView({ behavior: "smooth", block: "start" });
      });
  } else {
    dispatch(push({ pathname: location, search: query }));
    if (anchor && document.querySelector(anchor)) document.querySelector(anchor).scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const toggleMobileNavigation = () => async (dispatch) => {
  dispatch({type: TOGGLE_MOBILE_NAVIGATION_MENU });
};