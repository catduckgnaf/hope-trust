import Symbol_observable from "symbol-observable"; // eslint-disable-line no-unused-vars
import { createBrowserHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "connected-react-router";
import { persistStore, persistReducer } from "redux-persist";
import promise from "redux-promise-middleware";
import LogRocket from "logrocket";
import storage from "localforage";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

storage.config({ name: "HopeTrust", storeName: "ht_db", driver: [storage.INDEXEDDB, storage.WEBSQL, storage.LOCALSTORAGE] });
const persistConfig = { key: "hopetrust", storage, timeout: null, blacklist: ["router"] };
const history = createBrowserHistory();
let middleware = [thunk, promise, routerMiddleware(history)];
if (!process.env.REACT_APP_LOCAL) middleware.push(LogRocket.reduxMiddleware());
const composeEnhancer = process.env.REACT_APP_STAGE !== "production" ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose) : compose;
const enhancer = composeEnhancer(applyMiddleware(...middleware));
const store = createStore(persistReducer(persistConfig, rootReducer(history)), enhancer);
const persistor = persistStore(store);
export { store, history, persistor };
