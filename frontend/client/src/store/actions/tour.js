import { SHOW_TOUR, HIDE_TOUR } from "./constants";
import { logEvent } from "./utilities";
import React from "react";
import { TourText } from "./style";
import { store } from "..";

const steps = [
  {
    target: "#request-buttons-dashboard",
    content: <TourText>These are your request buttons. You can make a real-time request for Money, Medical, Food, Transportation and any special requests.<br /><br />Our Care Coordinators will receive and process your request.</TourText>,
    title: "Care Requests",
    permissions: ["request-hcc-edit"],
    disableBeacon: true,
    spotlightClicks: false
  },
  {
    target: "#finance-graphs-dashboard",
    content: <TourText>Finances are an important part of our platform. The more data that is added, the better we are able to help manage funds and learn about habits.</TourText>,
    title: "Finances",
    permissions: ["finance-view", "finance-edit", "budget-view", "budget-edit", "myto-view", "myto-edit", "grantor-assets-view", "grantor-assets-edit"],
    disableBeacon: true,
    spotlightClicks: false
  },
  {
    target: "#hope-care-plan-dashboard",
    content: <TourText>The engine of Hope Trust. The surveys are the most important part of how we learn about your unique situation and generate your custom plan.<br /><br />By answering our comprehensive survey categories, we will be able to create a one of a kind care plan just for you.</TourText>,
    title: "Care Plan Surveys",
    permissions: ["health-and-life-edit"],
    disableBeacon: true,
    spotlightClicks: false
  },
  {
    target: "#contact-widget-dashboard",
    content: <TourText>You can contact our Hope Trust representatives and coordinators at any time, just use these buttons and we'll help you get in touch.<br /><br />Give it a try. Click any of these buttons to get started. </TourText>,
    title: "Communication",
    permissions: [],
    disableBeacon: true,
    spotlightClicks: true
  },
  {
    target: "#users-list-dashboard",
    content: <TourText>Your family and friends will be a big part of your Hope Trust journey.<br /><br />By adding additional relationships, you allow your family and friends to help care for and manage your account.</TourText>,
    title: "Account Users",
    permissions: ["account-admin-view", "account-admin-edit"],
    disableBeacon: true,
    spotlightClicks: false
  },
  {
    target: "#generation-widget-dashboard",
    content: <TourText>Information gathered from your surveys is processed by our natural language software and generated into readable documents. You can generate all or part of those documents here.</TourText>,
    title: "Document Generation",
    permissions: ["health-and-life-view", "health-and-life-edit", "finance-view", "finance-edit", "budget-view", "budget-edit", "myto-view", "myto-edit", "grantor-assets-view", "grantor-assets-edit"],
    disableBeacon: true,
    spotlightClicks: false
  },
  {
    target: "#request-feeds-dashboard",
    content: <TourText>All of your account requests will appear here. Any request that has been received by our Care Coordinators will be updated here.<br/><br/>By clicking on a single ticket you can view more details and communicate live with your assigned coordinator.</TourText>,
    title: "Account Activity",
    permissions: ["request-hcc-view", "request-hcc-edit"],
    disableBeacon: true,
    spotlightClicks: false
  },
  {
    target: "#documents-list-dashboard",
    content: <TourText>Throughout your journey with Hope Trust there will be many documents to keep track of.<br /><br />We've made it easy to manage your documents and keep the sensitive ones safe and secure.</TourText>,
    title: "Documents",
    permissions: [],
    disableBeacon: true,
    spotlightClicks: false
  }
];

export const generateSteps = () => (dispatch) => {
  const account = store.getState().accounts.find((account) => account.account_id === store.getState().session.account_id);
  let active_steps = [];
  steps.forEach((step) => {
    const valid_step = step.permissions.some((permission) => account.permissions.includes(permission));
    if (valid_step) {
      active_steps.push(step);
    } else if (!step.permissions.length) {
      active_steps.push(step);
    }
  });
  return active_steps;
};

export const showTour = () => async (dispatch) => {
  dispatch(logEvent("Ran Tour"));
  dispatch({ type: SHOW_TOUR });
};

export const closeTour = () => async (dispatch) => {
  dispatch(logEvent("Closed Tour"));
  dispatch({ type: HIDE_TOUR });
};
