import React from "react";
import { Bold, SlideComponentTitle, SlideComponentSubtitle } from "../../../Components/multipart-form/elements.styles";
import { retrieveReduxState } from "../../../store/actions/utilities";
import authenticated from "../../../store/actions/authentication";

const config = {
  id: "authorize_slide",
  title: (stateRetriever) => "Authorization",
  secondaryCta: {
    position: "right",
    label: "Log Out",
    action: () => authenticated.logOut()
  },
  collector: "registration_config",
  Component: (stateRetriever, stateConsumer) => {
    return (
      <SlideComponentTitle>
        Would you like to sign up <Bold>{retrieveReduxState("user").partner_data.name}</Bold> to use the Hope Trust platform?
        <SlideComponentSubtitle>By choosing "Yes" you are confirming your authorization to sign on behalf of <Bold>{retrieveReduxState("user").partner_data.name}</Bold>.</SlideComponentSubtitle>
      </SlideComponentTitle>
    );
  },
  component_validators: [],
  cta: {
    actionLabel: () => "Yes",
    action: (stateRetriever, stateConsumer) => {
      stateConsumer("authorized", true, "registration_config");
      stateConsumer("is_entity", true, "partner_details");
    },
    additionalButton: {
      actionLabel: () => "No",
      action: (stateRetriever, stateConsumer) => {
        stateConsumer("authorized", false, "registration_config");
        stateConsumer("is_entity", false, "partner_details");
      }
    }
  },
  lifecycle: {
    onLoad: async (stateConsumer, helpers, stateRetriever) => {
      await helpers.getOrganizationPartners({ name: retrieveReduxState("user").partner_data.name, contract_sign: true }, false);
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => null,
    shouldRender: (stateRetriever, helpers) => !stateRetriever("authorized")
  }
};

export default config;