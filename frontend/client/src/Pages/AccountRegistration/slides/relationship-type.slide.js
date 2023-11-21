import React from "react";
import RelationshipPicker from "../../../Components/RelationshipPicker";
import { retrieveReduxState } from "../../../store/actions/utilities";
import authenticated from "../../../store/actions/authentication";

const config = {
  id: "relationship_type_slide",
  title: (stateRetriever) => "What Is Your Relationship To The Account?",
  secondaryCta: {
    position: "right",
    label: "Sign Out",
    action: () => authenticated.logOut()
  },
  collector: "account_details",
  Component: (stateRetriever, stateConsumer) => <RelationshipPicker stateConsumer={stateConsumer} stateRetriever={stateRetriever} />,
  component_validators: [
    (stateRetriever) => stateRetriever("user_type")
  ],
  cta: {
    actionLabel: (stateRetriever) => (stateRetriever("user_type") === "beneficiary" && !stateRetriever("is_benefits") && !retrieveReduxState("user").benefits_client_config) ? "Complete" : "Next"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers) => null,
    onSubmit: (stateRetriever, stateConsumer, helpers) => (stateRetriever("user_type") === "beneficiary" && !stateRetriever("is_benefits") && !retrieveReduxState("user").benefits_client_config) ? helpers.runRegisterAccount() : null,
    shouldRender: (stateRetriever) => true
  }
};

export default config;