import React from "react";
import { retrieveReduxState } from "../../../store/actions/utilities";
import RelationshipPicker from "../../../Components/RelationshipPicker";
import authenticated from "../../../store/actions/authentication";  
import { HeavyFont } from "../../../global-components";

const account_types = (stateRetriever) => {
  return [
    {
      name: "new",
      alias: "New Account",
      text: <>Your organization or agency {<HeavyFont>is not</HeavyFont>} currently a part of the Hope Trust Benefits network.</>,
      shouldRender: true
    },
    {
      name: "addition",
      alias: "New Member",
      text: <>Your organization or agency {<HeavyFont>is</HeavyFont>} currently a part of the Hope Trust Benefits network and you would like to join as a new account user.</>,
      shouldRender: true
    }
  ];
};

const config = {
  id: "account_options",
  title: (stateRetriever) => "How Would You Like To Register?",
  collector: "account_details",
  secondaryCta: {
    position: "right",
    label: "Sign Out",
    action: () => authenticated.logOut()
  },
  Component: (stateRetriever, stateConsumer) => <RelationshipPicker stateConsumer={stateConsumer} stateRetriever={stateRetriever} options={account_types} filter="account_type" />,
  component_validators: [
    (stateRetriever) => stateRetriever("account_type")
  ],
  cta: {
    actionLabel: (stateRetriever) => "Next"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      stateConsumer("account_type", "new", "account_details");
      if (!stateRetriever("matched_orgs")) stateConsumer("matched_orgs", [], "account_details");
      if (helpers.location.query.unjoin === "true") {
        helpers.getAllOrgs(true);
        stateConsumer("unjoin", true, "account_details");
        window.history.pushState({}, document.title, window.location.pathname);
      }
    },
    onSubmit: (stateRetriever, stateConsumer, helpers) => stateConsumer("user_type", "", "account_details"),
    shouldRender: (stateRetriever) => {
      if (retrieveReduxState("user").benefits_data && retrieveReduxState("user").benefits_data.status === "pending") return false;
      if (!stateRetriever("loading", true) && stateRetriever("fetched_all") && (!stateRetriever("matched_orgs") || !stateRetriever("matched_orgs").length) && !stateRetriever("create_override")) return true;
      if (stateRetriever("create_override")) return true;
      return false;
    }
  }
};

export default config;