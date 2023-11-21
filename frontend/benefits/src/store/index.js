import Symbol_observable from "symbol-observable"; // eslint-disable-line no-unused-vars
import { createBrowserHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "connected-react-router";
import { persistStore, persistReducer } from "redux-persist";
import promise from "redux-promise-middleware";
import LogRocket from "logrocket";
import ReactGA from "react-ga";
import storage from "localforage";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import { google } from "../config";

storage.config({ name: "HopeTrust", storeName: "ht_db", driver: [storage.INDEXEDDB, storage.WEBSQL, storage.LOCALSTORAGE] });
const persistConfig = { key: "hopetrust", storage, timeout: null, blacklist: ["router"] };
const history = createBrowserHistory();
ReactGA.initialize(google.GOOGLE_ANALYTICS_TRACKING_ID, { debug: process.env.REACT_APP_LOCAL, titleCase: true, testMode: process.env.REACT_APP_STAGE !== "production" });
const gaTrackingMiddleware = (store) => (next) => (action) => {
  if (action.type === "@@router/LOCATION_CHANGE") {
    const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`;
    ReactGA.pageview(nextPage);
  }
  return next(action);
};
let middleware = [thunk, promise, routerMiddleware(history), gaTrackingMiddleware];
if (!process.env.REACT_APP_LOCAL) middleware.push(LogRocket.reduxMiddleware());
const composeEnhancer = process.env.REACT_APP_STAGE !== "production" ? ((window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true })) || compose) : compose;
const enhancer = composeEnhancer(applyMiddleware(...middleware));
const store = createStore(persistReducer(persistConfig, rootReducer(history)), enhancer);
const persistor = persistStore(store);
export { store, history, persistor };