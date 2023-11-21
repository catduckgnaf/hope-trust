import { getUserAge } from "../../utilities";
import { navigateTo } from "./navigation";
import { toastr } from "react-redux-toastr";
import authentication from "./authentication";
import hopeCarePlan from "./hope-care-plan";
import { getBudget } from "./budgets";
import { getGrantorAssets } from "./grantor-assets";
import { getBeneficiaryAssets } from "./beneficiary-assets";
import { getIncome } from "./income";
import { getBenefits } from "./benefits";
import { getMYTOSimulations } from "./myto";
import { getDocuments } from "./document";
import { getProviders } from "./provider";
import { getRelationships } from "./account";
import { getMedications } from "./medication";
import { getEvents } from "./schedule";
import { getRequests } from "./request";
import { updateHubspotContact } from "./hubspot";
import { getStripeExpandedCustomer } from "./stripe";
import { showNotification } from "./notification";
import LogRocket from "logrocket";
import ReactGA from "react-ga4";
import config from "../../config";
import axios from "axios";
import { store } from "..";
import {
  IS_ACTIVE,
  IS_IDLE,
  // USER_DID_ACTION,
  UPDATE_APPLICATION_STATUS,
  UPDATE_SURVEY_STATUS,
} from "./constants";
import { updateUserStatus } from "./user";

export const getAccountTypeColor = (type) => {
  const core_settings = store.getState().customer_support.core_settings;
  const asset = core_settings.asset_types.find((a) => a.type === type);
  if (asset) return asset.color;
  return "grey";
};

export const getIncomeTypeColor = (type) => {
  const core_settings = store.getState().customer_support.core_settings;
  const income = core_settings.income_types.find((a) => a.type === type);
  if (income) return income.color;
  return "grey";
};

export const getBenefitTypeColor = (type) => {
  const core_settings = store.getState().customer_support.core_settings;
  const benefit = core_settings.benefit_types.find((a) => a.type === type);
  if (benefit) return benefit.color;
  return "grey";
};

export const getParentBudgetTypeColor = (type) => {
  const core_settings = store.getState().customer_support.core_settings;
  const expense = core_settings.budget_categories.find((a) => a.category === type);
  if (expense) return expense.parent_color;
  return "grey";
};

export const getBudgetTypeColor = (type) => {
  const core_settings = store.getState().customer_support.core_settings;
  const expense = core_settings.budget_categories.find((a) => a.name === type);
  if (expense) return expense.color;
  return "grey";
};

export const getTrustAssetValues = (data) => {
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const color = getAccountTypeColor(item.account_type);
    if (item.account_type && item.type) {
      datasets[0].data.push(item.trust_assets);
      labels.push(item.friendly_name || item.account_type);
      if (color) datasets[0].backgroundColor.push(color);
    }
  }
  return { datasets, labels };
};

export const getAssetValues = (data) => {
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const color = getAccountTypeColor(item.account_type);
    if (item.account_type && item.type) {
      datasets[0].data.push(item.value);
      labels.push(item.friendly_name || item.account_type);
      if (color) datasets[0].backgroundColor.push(color);
    }
  }
  return { datasets, labels };
};

export const getBeneficiaryAssetValues = (data) => {
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const color = getAccountTypeColor(item.account_type);
    if (item.account_type && item.type) {
      datasets[0].data.push(item.has_debt ? (item.value - item.debt) : item.value);
      labels.push(item.friendly_name || item.account_type);
      if (color) datasets[0].backgroundColor.push(color);
    }
  }
  return { datasets, labels };
};

export const getIncomeValues = (data, birthday) => {
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const color = getIncomeTypeColor(item.income_type);
    if (item.income_type && (item.term.length && item.term[0] <= getUserAge(birthday))) {
      datasets[0].data.push(item.monthly_income);
      labels.push(item.income_type);
      if (color) datasets[0].backgroundColor.push(color);
    }
  }
  return { datasets, labels };
};

export const getBenefitValues = (data, birthday) => {
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const color = getBenefitTypeColor(item.program_name);
    if (item.program_name && (item.term.length && item.term[0] <= getUserAge(birthday))) {
      datasets[0].data.push(item.value);
      labels.push(item.program_name);
      if (color) datasets[0].backgroundColor.push(color);
    }
  }
  return { datasets, labels };
};

export const getBudgetValues = (data, birthday) => {
  let categories = {};
  data = data.filter((item) => {
    if (item.budget_category && (item.term.length && item.term[0] <= getUserAge(birthday))) {
      return item;
    }
    return false;
  });
  data.filter((e) => e).forEach((item) => categories[item.parent_category] = Number(categories[item.parent_category] || 0) + item.value);
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  let keys = Object.keys(categories);
  for (let i = 0; i < keys.length; i++) {
    const item = keys[i];
    const color = getParentBudgetTypeColor(item);
    if (item) {
      datasets[0].data.push(categories[item]);
      labels.push(item);
      if (color) datasets[0].backgroundColor.push(color);
    }
  }
  return { datasets, labels };
};

export const getBudgetCategoryValues = (data, birthday) => {
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const color = getBudgetTypeColor(item.budget_category);
    if (item.budget_category && (item.term.length && item.term[0] <= getUserAge(birthday))) {
      datasets[0].data.push(item.value);
      labels.push(item.budget_category);
      if (color) datasets[0].backgroundColor.push(color);
    }
  }
  return { datasets, labels };
};

export const getMYTOGraphValues = (data) => {
  let labels = [];
  let datasets = [
    { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" }
  ];
  
  if (data.total_benefits_value > 0) {
    if (data.trust_fund_gap_without_benefits) {
      datasets[0] = { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" };
      datasets[0].data.push((data.trust_fund_gap_without_benefits < 0 ? 0 : data.trust_fund_gap_without_benefits));
      datasets[0].data.push((data.current_available < 0 ? 0 : data.current_available));
      datasets[0].backgroundColor.push("#ffa703");
      datasets[0].backgroundColor.push("#529134");
      labels.push("Gap Without Benefits");
      labels.push("Available Assets");
    } else if (data.trust_funding_gap) {
      datasets[0].data.push((data.trust_funding_gap < 0 ? 0 : data.trust_funding_gap));
      datasets[0].data.push((data.current_available < 0 ? 0 : data.current_available));
      datasets[0].backgroundColor.push("#ff6803");
      datasets[0].backgroundColor.push("#349154");
      labels.push("Gap With Benefits");
      labels.push("Available Assets");
    }
  } else {
    if (data.trust_fund_gap_without_benefits) {
      datasets[0] = { data: [], backgroundColor: [], hoverBorderColor: "#FFFFFF" };
      datasets[0].data.push((data.trust_fund_gap_without_benefits < 0 ? 0 : data.trust_fund_gap_without_benefits));
      datasets[0].data.push((data.current_available < 0 ? 0 : data.current_available));
      datasets[0].backgroundColor.push("#ff6803");
      datasets[0].backgroundColor.push("#349154");
      labels.push("Gap With Benefits");
      labels.push("Available Assets");
    } else if (data.trust_funding_gap) {
      datasets[0].data.push((data.trust_funding_gap < 0 ? 0 : data.trust_funding_gap));
      datasets[0].data.push((data.current_available < 0 ? 0 : data.current_available));
      datasets[0].backgroundColor.push("#ffa703");
      datasets[0].backgroundColor.push("#529134");
      labels.push("Gap Without Benefits");
      labels.push("Available Assets");
    }
  }
  return { datasets, labels };
};

export const isIdle = (e, seconds = 60, message = "") => async (dispatch) => {
  dispatch(updateUserStatus(store.getState().user.cognito_id, true, true));
  dispatch({ type: IS_IDLE, payload: { seconds, idle_message: message } });
};

export const isActive = (e) => async (dispatch) => {
  dispatch(updateUserStatus(store.getState().user.cognito_id, true));
  dispatch({ type: IS_ACTIVE });
};

export const onAction = (e) => async (dispatch) => {
   // dispatch({ type: USER_DID_ACTION });
};

export const injectUserSnap = (user, session) => async (dispatch) => {
  const snap_config = {
    user: {
      userId: user.cognito_id,
      email: user.email,
    },
    custom: {
      account: session.account_id,
      appVersion: store.getState().customer_support.core_settings.client_app_version,
      environment: process.env.REACT_APP_STAGE,
      first_name: user.first_name,
      last_name: user.last_name,
      application: "client",
      logrocket_url: LogRocket.sessionURL
    }
  };
  window.onUsersnapLoad = (api) => {
    api.init(snap_config);
    window.Usersnap = api;
  };
  const newScript = document.createElement("script");
  newScript.id = "usersnap-embed-script";
  newScript.type = "text/javascript";
  newScript.async = true;
  newScript.defer = 1;
  newScript.src = `https://widget.usersnap.com/global/load/${config.usersnap.USERSNAP_API_KEY}?onload=onUsersnapLoad`;
  const existingScripts = document.getElementsByTagName("script")[0];
  existingScripts.parentNode.insertBefore(newScript, existingScripts);
};

export const getApplicationStatus = () => async (dispatch) => {
  const application = await axios.get("https://lsfjfc30yhxc.statuspage.io/api/v2/summary.json");
  if (application.status === 200) dispatch({ type: UPDATE_APPLICATION_STATUS, payload: application.data });
};

export const getSurveyStatus = () => async (dispatch) => {
  if (!store.getState().session.idle) {
    let status = {};
    const alchemer = await axios.get("https://alchemer.statuspage.io/api/v2/summary.json");
    const history = await axios.get("https://alchemer.statuspage.io/history.json");
    return dispatch(getApplicationStatus())
    .then(() => {
      if (alchemer.status === 200) status.alchemer = alchemer.data;
      if (history.status === 200) status.history = history.data;
      dispatch({ type: UPDATE_SURVEY_STATUS, payload: status });
    });
  }
};

export const claimThisEmail = (email) => async (dispatch) => {
  const claimOptions = {
    onOk: () => dispatch(navigateTo("/login", `?email=${email}`)),
    onCancel: () => toastr.removeByType("confirms"),
    okText: "Login",
    cancelText: "Cancel",
    buttons: [
      { text: "Reset Password", handler: () => {
        dispatch(navigateTo("/reset-password", `?email=${email}`));
      }},
      { cancel: true }
    ]
  };
  toastr.confirm("Users may not reuse their email address to signup for multiple Hope Trust accounts. If you want to create additional accounts, please login and navigate to your Accounts page.\n\nChoose one of the below options if you would like to access this account.", claimOptions);
};

export const onRefresh = (action) => async (dispatch) => {
  const account = store.getState().accounts.find((account) => account.account_id === store.getState().session.account_id);
  return new Promise((resolve) => {
    switch(action) {
      case "Account Users":
        if (account.permissions.includes("account-admin-view")) dispatch(getRelationships(true));
        break;
      case "Finances":
        if (account.permissions.includes("budget-view")) dispatch(getBudget(true));
        if (account.permissions.includes("grantor-assets-view")) dispatch(getGrantorAssets(true));
        if (account.permissions.includes("beneficiary-assets-view")) dispatch(getBeneficiaryAssets(true));
        if (account.permissions.includes("finance-view")) dispatch(getIncome(true));
        if (account.permissions.includes("finance-view")) dispatch(getBenefits(true));
        if (account.permissions.includes("myto-view")) dispatch(getMYTOSimulations(true, 0, 100));
        break;
      case "Providers":
        if (account.permissions.includes("health-and-life-view")) dispatch(getProviders(true));
        break;
      case "Hope Care Plan":
        if (account.permissions.includes("health-and-life-edit")) dispatch(hopeCarePlan.buildAccountSurveys(true));
        break;
      case "Schedule":
        if (account.permissions.includes("health-and-life-view")) dispatch(getEvents(true));
        break;
      case "Medications":
        if (account.permissions.includes("health-and-life-view")) dispatch(getMedications(true));
        break;
      case "Documents":
        dispatch(getDocuments(true));
        break;
      case "Activity Feed":
        if (account.permissions.includes("request-hcc-view")) dispatch(getRequests(true));
        break;
      case "Billing":
        const creator = store.getState().relationship.list.find((user) => user.is_customer && !user.linked_account);
        if (account.permissions.includes("account-admin-edit")) dispatch(getStripeExpandedCustomer(true, creator.customer_id));
        break;
      case "Dashboard":
        if (account.permissions.includes("account-admin-view")) dispatch(getRelationships(true));
        if (account.permissions.includes("budget-view")) dispatch(getBudget(true));
        if (account.permissions.includes("grantor-assets-view")) dispatch(getGrantorAssets(true));
        if (account.permissions.includes("beneficiary-assets-view")) dispatch(getBeneficiaryAssets(true));
        if (account.permissions.includes("finance-view")) dispatch(getIncome(true));
        if (account.permissions.includes("finance-view")) dispatch(getBenefits(true));
        if (account.permissions.includes("myto-view")) dispatch(getMYTOSimulations(true, 0, 100));
        if (account.permissions.includes("health-and-life-view")) dispatch(getProviders(true));
        if (account.permissions.includes("health-and-life-edit")) dispatch(hopeCarePlan.buildAccountSurveys(true));
        if (account.permissions.includes("request-hcc-view")) dispatch(getRequests(true));
        dispatch(getDocuments(true));
        break;
      case "My Accounts":
      case "Account Management":
      case "Training":
      case "Settings":
      case "Update Subscription":
      case "Terms Of Service":
      case "Software As A Service Agreement":
      case "Login":
      case "Signup":
      case "Partner Signup":
      case "Customer Support Signup":
      case "Customer Support Login":
      case "Forgot Password":
      case "Reset Password":
        break;
      default:
        dispatch(authentication.login());
        break;
    }
    setTimeout(resolve, 1000);
  });
};

export const redirectAfterSwitch = (is_switching, current_location) => async (dispatch) => {
  if (current_location) {
    dispatch(navigateTo(current_location));
  } else if (is_switching) {
    dispatch(navigateTo("/"));
  } else {
    dispatch(navigateTo("/accounts"));
  }
  return true;
};

export const copyToClipboard = (text, type) => async (dispatch) => {
  let textField = document.createElement("textarea");
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand("copy");
  textField.remove();
  dispatch(showNotification("success", type ? `${type} copied!` : "Text Copied!", ""));
};

export const logEvent = (type, user = store.getState().user, element = "", label = "") => async (dispatch) => {
  let logrocket_config = { last_event: type };
  if (user) {
    const account = store.getState().accounts.find((account) => account.account_id === store.getState().session.account_id);
    logrocket_config.name = `${user.first_name} ${user.last_name}`;
    logrocket_config.email = user.email;
    if (user.hubspot_contact_id) logrocket_config.hubspot_contact_id = user.hubspot_contact_id;
    if (account) logrocket_config.plan_id = account.plan_id;
    if (user.is_partner) logrocket_config.is_partner = user.is_partner;
    if (user.is_partner) logrocket_config.partner_type = account?.type || user.partner_data.partner_type;
    if (user.is_partner) logrocket_config.contract_signed = user.partner_data.contract_signed;
    if (user.is_partner) logrocket_config.plan_type = user.partner_data.plan_type;
    if (user.is_partner) logrocket_config.organization = user.partner_data.name;
    if (user.is_partner && user.coupon) logrocket_config.referral_code = user.coupon.id;
    LogRocket.identify(user.cognito_id, logrocket_config);
  }
  ReactGA.event({ category: "Application Events", action: type, label: label || (!process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost") });
  if (["login", "refresh auth"].includes(type) && user) ReactGA.set({ user_id: user.cognito_id, appName: config.system.name, appVersion: String(store.getState().customer_support.core_settings.app_version) });
  if (!user) ReactGA.event({ category: "Visitor Events", action: type, label: label || (!process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost") });
  LogRocket.track(type, logrocket_config);
  dispatch(updateHubspotContact(user.hubspot_contact_id, [
    { "property": "last_action", "value": type },
    { "property": "last_session_url", "value": !process.env.REACT_APP_LOCAL ? LogRocket.sessionURL : "localhost" }
  ]));
};

export const retrieveReduxState = (key) => {
  return store.getState()[key];
};