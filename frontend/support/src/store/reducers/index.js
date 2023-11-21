import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import authenticationReducer from "./authentication";
import sessionReducer from "./session";
import loaderReducer from "./loader";
import settingsReducer from "./settings";
import securityQuestionsReducer from "./security-questions";
import navigationReducer from "./navigation";
import signupReducer from "./signup";
import customerSupportSignupReducer from "./customer-support-signup";
import documentsReducer from "./documents";
import accountReducer from "./account";
import { reducer as toastr } from "react-redux-toastr";
import loginReducer from "./login";
import customerSupportReducer from "./customer-support";
import notificationsReducer from "./notification";
import referralsReducer from "./referral";
import plansReducer from "./plans";
import productReducer from "./product";
import messageReducer from "./message";
import helloSignReducer from "./hello-sign";
import retailReducer from "./retail";
import agentsReducer from "./agents";
import groupsReducer from "./groups";
import teamsReducer from "./teams";
import wholesaleReducer from "./wholesale";
import ticketsReducer from "./tickets";
import ce_configsReducer from "./ce-management";
import surveyReducer from "./survey";

const master_reducer = (history) => combineReducers({
  router: connectRouter(history),
  session: sessionReducer,
  login: loginReducer,
  account: accountReducer,
  user: authenticationReducer,
  loader: loaderReducer,
  settings: settingsReducer,
  security: securityQuestionsReducer,
  navigation: navigationReducer,
  signup: signupReducer,
  customer_support_signup: customerSupportSignupReducer,
  documents: documentsReducer,
  customer_support: customerSupportReducer,
  referral: referralsReducer,
  notification: notificationsReducer,
  tickets: ticketsReducer,
  plans: plansReducer,
  product: productReducer,
  message: messageReducer,
  hello_sign: helloSignReducer,
  retail: retailReducer,
  agents: agentsReducer,
  groups: groupsReducer,
  teams: teamsReducer,
  wholesale: wholesaleReducer,
  ce_management: ce_configsReducer,
  survey: surveyReducer,
  toastr
});

export default master_reducer;
