import React, { Component } from "react";
import { Provider } from "beautiful-react-redux";
import { ConnectedRouter } from "connected-react-router";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, history } from "./store";
import { GlobalStyle } from "./global-styles";
import authenticated from "./store/actions/authentication";
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
import { hotjar } from "react-hotjar";
import "react-app-protect/dist/index.css";
import "react-simple-flex-grid/lib/main.css";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import "react-responsive-modal/styles.css";
import { useDispatch } from "react-redux";

library.add(far);
library.add(fas);
library.add(fad);
library.add(fal);
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
      if (document.visibilityState === "hidden") dispatch(authenticated.updateUserStatus(store.getState().user.cognito_id, true, true));
      if (document.visibilityState === "visible") dispatch(authenticated.updateUserStatus(store.getState().user.cognito_id, true, false));
    }
  });
  return null;
};

class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<LoaderOverlay show={true} message="Loading..." />} persistor={persistor}>
          <ConnectedRouter history={history}>
            <GlobalStyle />
            <IdleHook />
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
