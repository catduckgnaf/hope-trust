import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import authenticationReducer from "./authentication";
import sessionReducer from "./session";
import loaderReducer from "./loader";
import settingsReducer from "./settings";
import navigationReducer from "./navigation";
import signupReducer from "./signup";
import customerSupportSignupReducer from "./customer-support-signup";
import documentsReducer from "./documents";
import accountReducer from "./account";
import { reducer as toastr } from "react-redux-toastr";
import loginReducer from "./login";
import customerSupportReducer from "./customer-support";
import notificationsReducer from "./notification";
import messageReducer from "./message";
import helloSignReducer from "./hello-sign";
import clientRegistrationReducer from "./client-registration";
import multiPartFormReducer from "./multipart-form";
import retailReducer from "./retail";
import agentsReducer from "./agents";
import groupsReducer from "./groups";
import teamsReducer from "./teams";
import clientsReducer from "./clients";
import wholesaleReducer from "./wholesale";
import relationshipReducer from "./relationship";
import securityQuestionsReducer from "./security-questions";
import plansReducer from "./plans";

const root_reducer = (history) => combineReducers({
  router: connectRouter(history),
  session: sessionReducer,
  login: loginReducer,
  account: accountReducer,
  user: authenticationReducer,
  loader: loaderReducer,
  settings: settingsReducer,
  navigation: navigationReducer,
  signup: signupReducer,
  customer_support_signup: customerSupportSignupReducer,
  security: securityQuestionsReducer,
  documents: documentsReducer,
  customer_support: customerSupportReducer,
  relationship: relationshipReducer,
  notification: notificationsReducer,
  message: messageReducer,
  hello_sign: helloSignReducer,
  client_registration: clientRegistrationReducer,
  multi_part_form: multiPartFormReducer,
  retail: retailReducer,
  agents: agentsReducer,
  groups: groupsReducer,
  teams: teamsReducer,
  clients: clientsReducer,
  wholesale: wholesaleReducer,
  plans: plansReducer,
  toastr
});

export default root_reducer;
