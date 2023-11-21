import React from "react";
import { PinCode } from "../../../Components/PinCode"

const config = {
  id: "mfa_slide",
  title: (stateRetriever) => "Validate Your Account",
  collector: "mfa_details",
  secondaryCta: {
    position: "left",
    label: "Cancel",
    helper: (stateRetriever, helpers) => helpers.setFlow("login", true)
  },
  Component: (stateRetriever, stateConsumer) => <PinCode stateRetriever={stateRetriever} stateConsumer={stateConsumer} />,
  component_validators: [
    (stateRetriever) => stateRetriever("mfa_complete")
  ],
  cta: {
    actionLabel: (stateRetriever) => "Submit"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      if (!stateRetriever("login_user")) helpers.setFlow("login");
      if (helpers.location.query.email) {
        stateConsumer("mfa_email", decodeURIComponent(helpers.location.query.email), "mfa_details");
        stateConsumer("mfa_email_valid", true, "mfa_details");
      }
      window.history.pushState({}, document.title, "/mfa-login");
    },
    onUnload: (stateConsumer) => null,
    onSubmit: (stateRetriever, stateConsumer, helpers) => stateRetriever("mfa_complete") ? helpers.confirmSignIn(stateRetriever("mfa_code")) : null,
    shouldRender: (stateRetriever) => stateRetriever("flow", true) === "mfa"
  }
};

export default config;