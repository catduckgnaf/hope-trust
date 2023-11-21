import React from "react";
import { Bold, SlideComponentTitle, SlideComponentSubtitle } from "../../../Components/multipart-form/elements.styles";
import { retrieveReduxState } from "../../../store/actions/utilities";
import { changeFormSlide } from "../../../store/actions/multipart-form";

const config = {
  id: "authorize_slide",
  title: (stateRetriever) => "Authorization",
  secondaryCta: {
    position: "right",
    label: "Back",
    action: (stateRetriever, helpers) => changeFormSlide((retrieveReduxState("multi_part_form").slide - 1))
  },
  collector: "registration_config",
  Component: (stateRetriever, stateConsumer) => {
    return (
      <SlideComponentTitle>
        Would you like to sign up <Bold>{stateRetriever("name")}</Bold> to use the Hope Trust Benefits Network?
        <SlideComponentSubtitle>By choosing "Yes" you are confirming your authorization to sign on behalf of <Bold>{stateRetriever("name")}</Bold>.</SlideComponentSubtitle>
      </SlideComponentTitle>
    );
  },
  component_validators: [],
  hidePrevious: (stateRetriever) => true,
  cta: {
    actionLabel: () => "Yes",
    action: (stateRetriever, stateConsumer) => stateConsumer("authorized", true, "registration_config"),
    additionalButton: {
      actionLabel: () => "No",
      action: (stateRetriever, stateConsumer) => stateConsumer("authorized", false, "registration_config")
    }
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      helpers.getAllOrgs();
      stateConsumer("authorized", false, "registration_config");
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => null,
    shouldRender: (stateRetriever, helpers) => {
      if (stateRetriever("user_type") === "agent") return false;
      if (retrieveReduxState("user").benefits_data && retrieveReduxState("user").benefits_data.status === "pending") return false;
      const found = (stateRetriever("all_orgs") || []).find((org) => org.type === stateRetriever("user_type") && org.name === stateRetriever("name"));
      if (!found && (stateRetriever("account_type") === "new")) return true;
      return false;
    }
  }
};

export default config;