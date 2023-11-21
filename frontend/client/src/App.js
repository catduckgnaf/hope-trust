import React, { Component } from "react";
import { Provider } from "beautiful-react-redux";
import { ConnectedRouter } from "connected-react-router";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, history } from "./store";
import { GlobalStyle } from "./global-styles";
import LoaderOverlay from "./Components/LoaderOverlay";
import HopeTrustRouter from "./HopeTrustRouter/";
import LogRocket from "logrocket";
import Protect from "react-app-protect";
import setupLogRocketReact from "logrocket-react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { fass } from "@fortawesome/sharp-solid-svg-icons";
import { fat } from "@fortawesome/pro-thin-svg-icons";
import { hotjar } from "react-hotjar";
import "react-app-protect/dist/index.css";
import "react-simple-flex-grid/lib/main.css";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import "react-responsive-modal/styles.css";
import { useDispatch } from "react-redux";
import { updateUserStatus } from "./store/actions/user";
import { sleep } from "./utilities";
import { UPDATE_APP_VERSION } from "./store/actions/constants";
import { showNotification } from "./store/actions/notification";

library.add(far);
library.add(fas);
library.add(fad);
library.add(fal);
library.add(fass);
library.add(fat);
library.add(fab);

if (!process.env.REACT_APP_LOCAL) {
  LogRocket.init("maqc00/hopetrust");
  setupLogRocketReact(LogRocket);
}
if (process.env.REACT_APP_STAGE === "production") hotjar.initialize(2710717, 6);

const IdleHook = () => {
  const dispatch = useDispatch();
  document.addEventListener("visibilitychange", () => {
    if (store.getState().user) {
      if (document.visibilityState === "hidden") dispatch(updateUserStatus(store.getState().user.cognito_id, true, true));
      if (document.visibilityState === "visible") dispatch(updateUserStatus(store.getState().user.cognito_id, true, false));
    }
  });
  return null;
};

const ServiceWorkerCheck = () => {
  const dispatch = useDispatch();
  if ("serviceWorker" in navigator) {
    // wait for the page to load
    window.addEventListener("load", async () => {
      // register the service worker from the file specified
      const registration = await navigator.serviceWorker.register("service-worker.js");
      // ensure the case when the updatefound event was missed is also handled
      // by re-invoking the prompt when there"s a waiting Service Worker
      if (registration.waiting) dispatch({ type: "NEW_VERSION" });
      if (registration.active && !registration.waiting) dispatch({ type: UPDATE_APP_VERSION });
      // detect Service Worker update available and wait for it to become installed
      registration.addEventListener("updatefound", () => {
        console.log("Update found.");
        if (registration.installing) {
          console.log("Installing updates");
          // wait until the new Service worker is actually installed (ready to take over)
          registration.installing.addEventListener("statechange", (changed) => {
            if (registration.waiting) {
              console.log("Waiting for activation");
              // if there"s an existing controller (previous Service Worker), show the prompt
              if (navigator.serviceWorker.controller) {
                console.log("Found new application version, prompting user.");
                dispatch({ type: "NEW_VERSION" });
              } else {
                // otherwise it"s the first install, nothing to do
                dispatch({ type: UPDATE_APP_VERSION });
                console.log("Service Worker initialized for the first time");
              }
            }
          });
        }
      });
      let refreshing = false;
      // detect controller change and refresh the page
      navigator.serviceWorker.addEventListener("controllerchange", async () => {
        console.log("Controller changed.");
        if (!refreshing) {
          caches.delete(`workbox-precache-v2-${window.location.origin}/`)
            .then(() => dispatch({ type: UPDATE_APP_VERSION }))
            .then(async () => {
              console.log("Cache deleted.")
              await sleep(3000);
              console.log("Application version updated.");
              dispatch(showNotification("success", "Application Updated", "Great! You are now running the latest version of Hope Trust. Reloading..."));
              window.location.reload(true);
              refreshing = true;
            });
        }
      });
    });
  } else {
    console.log("Service workers are not supported in this browser.");
  }
  return null;
}

class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<LoaderOverlay show={true} message="Loading..." />} persistor={persistor}>
          <ConnectedRouter history={history}>
            <GlobalStyle />
            <IdleHook />
            {!process.env.REACT_APP_IS_LOCAL
              ? <ServiceWorkerCheck />
              : null
            }
            {!process.env.REACT_APP_LOCAL && process.env.REACT_APP_STAGE !== "production"
              ? (
                <Protect blur={true} wrapperClass="password-protected-environment" boxTitle="This Environment is Protected" buttonLabel="Authorize" inputPlaceholder={`Enter the ${process.env.REACT_APP_STAGE ? process.env.REACT_APP_STAGE : "development"} password...`} sha512="FFE8E2E3EA253831F5D7094C01F94668B6E0C36E467A341EEC32DEF624F6D7867960F2DDB404CCF173446E7746919AB1514186930D080D6A1442778AD86CC6C4">
                  <HopeTrustRouter />
                </Protect>
              )
              : <HopeTrustRouter />
            }
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
