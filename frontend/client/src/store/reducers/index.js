import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import authenticationReducer from "./authentication";
import sessionReducer from "./session";
import loaderReducer from "./loader";
import requestReducer from "./request";
import settingsReducer from "./settings";
import securityQuestionsReducer from "./security-questions";
import navigationReducer from "./navigation";
import signupReducer from "./signup";
import documentsReducer from "./documents";
import providerReducer from "./provider";
import relationshipReducer from "./relationship";
import hopeCarePlanReducer from "./hope-care-plan";
import financeReducer from "./finance";
import grantorAssetsReducer from "./grantor-assets";
import beneficiaryAssetsAssetsReducer from "./beneficiary-assets";
import incomeReducer from "./income";
import benefitsReducer from "./benefits";
import budgetsReducer from "./budgets";
import plaidReducer from "./plaid";
import accountReducer from "./account";
import accountsReducer from "./accounts";
import mytoReducer from "./myto";
import { reducer as toastr } from "react-redux-toastr";
import tourReducer from "./tour";
import loginReducer from "./login";
import pdfReducer from "./pdf";
import scheduleReducer from "./schedule";
import medicationReducer from "./medication";
import customerSupportReducer from "./customer-support";
import classMarkerReducer from "./class-marker";
import helloSignReducer from "./hello-sign";
import partnersReducer from "./partners";
import notificationsReducer from "./notification";
import partnerRegistrationReducer from "./partner-registration";
import clientRegistrationReducer from "./client-registration";
import plansReducer from "./plans";
import productReducer from "./product";
import messageReducer from "./message";
import multiPartFormReducer from "./multipart-form";
import ce_configsReducer from "./ce-management";

export default (history) => combineReducers({
  router: connectRouter(history),
  session: sessionReducer,
  login: loginReducer,
  account: accountReducer,
  accounts: accountsReducer,
  user: authenticationReducer,
  loader: loaderReducer,
  request: requestReducer,
  settings: settingsReducer,
  security: securityQuestionsReducer,
  navigation: navigationReducer,
  signup: signupReducer,
  documents: documentsReducer,
  provider: providerReducer,
  relationship: relationshipReducer,
  survey: hopeCarePlanReducer,
  finance: financeReducer,
  grantor_assets: grantorAssetsReducer,
  beneficiary_assets: beneficiaryAssetsAssetsReducer,
  income: incomeReducer,
  benefits: benefitsReducer,
  budgets: budgetsReducer,
  plaid: plaidReducer,
  myto: mytoReducer,
  tour: tourReducer,
  pdf: pdfReducer,
  schedule: scheduleReducer,
  medication: medicationReducer,
  customer_support: customerSupportReducer,
  class_marker: classMarkerReducer,
  hello_sign: helloSignReducer,
  partners: partnersReducer,
  partner_registration: partnerRegistrationReducer,
  client_registration: clientRegistrationReducer,
  notification: notificationsReducer,
  plans: plansReducer,
  product: productReducer,
  message: messageReducer,
  multi_part_form: multiPartFormReducer,
  ce_config: ce_configsReducer,
  toastr
});
