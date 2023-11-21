import React from "react";
import { ActivePlansChooser } from "../../../Components/ActivePlansChooser";
import { retrieveReduxState } from "../../../store/actions/utilities";
import authenticated from "../../../store/actions/authentication";

const config = {
  id: "plan_slide",
  title: (stateRetriever) => "Select a service tier",
  secondaryCta: {
    position: "right",
    label: "Log Out",
    action: () => authenticated.logOut()
  },
  collector: "registration_config",
  Component: (stateRetriever, stateConsumer) => <ActivePlansChooser page="registration" type="partner" stateRetriever={stateRetriever} stateConsumer={stateConsumer} />,
  component_validators: [
    (stateRetriever) => stateRetriever("plan_choice")
  ],
  cta: {
    actionLabel: () => "Next"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      window.history.pushState({}, document.title, window.location.pathname);
      helpers.fetchActivePlans(stateRetriever("partner_type"), retrieveReduxState("user").partner_data.name, retrieveReduxState("user").cognito_id);
      helpers.getOrganizationPartners({ name: retrieveReduxState("user").partner_data.name, contract_sign: true }, false);
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => !stateRetriever("card_name") ? stateConsumer("card_name", `${retrieveReduxState("user").first_name} ${retrieveReduxState("user").last_name}`, "registration_config") : null,
    shouldRender: (stateRetriever, helpers) => (stateRetriever("authorized") || retrieveReduxState("partners").organization_partners.length)
  }
};

export default config;