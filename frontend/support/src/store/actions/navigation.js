import { push } from "connected-react-router";
import { Auth } from "aws-amplify";
import { store } from "..";
import { TOGGLE_MOBILE_NAVIGATION_MENU, SET_SESSION_ACCOUNT, CLEAR_ALL } from "./constants";

export const navigateTo = (location, query) => async (dispatch) => {
  if (store.getState().user) {
    Auth.currentAuthenticatedUser({ bypassCache: true })
      .then(async (user) => {
        const session = await Auth.currentSession();
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: store.getState().session.account_id, token: session.idToken.jwtToken, user } });
        dispatch(push({ pathname: location, search: query }));
      })
      .catch(() => {
        dispatch({ type: CLEAR_ALL });
        dispatch(push({ pathname: "/login", search: query }));
      });
  } else {
    dispatch(push({ pathname: location, search: query }));
  }
};

export const toggleMobileNavigation = () => async (dispatch) => {
  dispatch({type: TOGGLE_MOBILE_NAVIGATION_MENU });
};