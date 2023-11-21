import React from "react";
import { ResolveMessage } from "../../../global-components";
import authenticated from "../../../store/actions/authentication";


const config = {
  id: "resolve_slide",
  title: () => "Something Went Wrong",
  collector: "resolve_config",
  secondaryCta: {
    position: "right",
    label: "Log Out",
    action: (stateRetriever, helpers) => authenticated.logOut()
  },
  Component: (stateRetriever, stateConsumer) => {
    return (
      <ResolveMessage>Your registration was not successful. To resolve this issue, please click the Resolve button below to complete registration again.</ResolveMessage>
    );
  },
  component_validators: [
    (stateRetriever) => stateRetriever("login_email")
  ],
  hidePrevious: () => true,
  cta: {
    actionLabel: () => "Resolve",
    haltNext: (stateRetriever) => true
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      if (helpers.location.query.email) {
        stateConsumer("resolve_email", decodeURIComponent(helpers.location.query.email), "resolve_details");
        stateConsumer("resolve_email_valid", true, "resolve_details");
      }
      window.history.pushState({}, document.title, "/resolve");
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => helpers.resolve(stateRetriever("login_email")),
    shouldRender: (stateRetriever) => stateRetriever("flow") === "resolve"
  }
};

export default config;