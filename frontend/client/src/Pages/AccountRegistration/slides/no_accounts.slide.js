import React from "react";
import NoAccountsRegistration from "../../../Components/NoAccountsRegistration";
import authenticated from "../../../store/actions/authentication";
import { retrieveReduxState } from "../../../store/actions/utilities";

const config = {
  id: "no_accounts_slide",
  title: (stateRetriever) => "No Accounts Found",
  secondaryCta: {
    position: "right",
    label: "Sign Out",
    action: () => authenticated.logOut()
  },
  collector: "account_details",
  Component: (stateRetriever, stateConsumer) => <NoAccountsRegistration stateConsumer={stateConsumer} stateRetriever={stateRetriever} />,
  component_validators: [],
  cta: {
    actionLabel: (stateRetriever) => "Next"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers) => null,
    onSubmit: (stateRetriever, stateConsumer, helpers) => null,
    shouldRender: (stateRetriever, helpers) => helpers.location.query.no_accounts === "true" && (!stateRetriever("is_benefits") && !retrieveReduxState("user").benefits_client_config)
  }
};

export default config;