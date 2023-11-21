import React from "react";
import { StripeBillingForm } from "../../../Components/StripeBillingForm";
import StripeElementsWrapper from "../../../Components/StripeElementsWrapper";
import { retrieveReduxState } from "../../../store/actions/utilities";

const config = {
  id: "billing_slide",
  title: (stateRetriever) => "Billing Information",
  collector: "registration_config",
  Component: (stateRetriever, stateConsumer, helpers, bulkComposeState) => {
    return (
      <StripeElementsWrapper>
        <StripeBillingForm stateRetriever={stateRetriever} stateConsumer={stateConsumer} helpers={helpers} bulkComposeState={bulkComposeState} type="partner"/>
      </StripeElementsWrapper>
    );
  },
  component_validators: [
    (stateRetriever) => stateRetriever("card_name"),
    (stateRetriever) => stateRetriever("card_number"),
    (stateRetriever) => stateRetriever("card_exp"),
    (stateRetriever) => stateRetriever("card_cvc"),
    (stateRetriever) => (stateRetriever("card_zip") && (stateRetriever("card_zip").length === 5))
  ],
  cta: {
    actionLabel: (stateRetriever) => ((stateRetriever("is_benefits") || retrieveReduxState("user").benefits_client_config) && stateRetriever("token")) ? "Complete" : "Add Card",
    haltNext: (stateRetriever) => true
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => helpers.getStripeExpandedCustomer(false, retrieveReduxState("user").customer_id),
    onUnload: (stateConsumer, helpers, stateRetriever) => stateConsumer("is_creating_token", false, "registration_config"),
    onSubmit: async (stateRetriever, stateConsumer, helpers) => {
      if (!stateRetriever("is_creating_token") && !stateRetriever("token")) document.getElementById("submit_stripe_form").click();
      if (stateRetriever("token")) await helpers.runRegisterAccount();
    },
    shouldRender: (stateRetriever) => (stateRetriever("is_benefits") || retrieveReduxState("user").benefits_client_config) && stateRetriever("plan_choice")
  }
};

export default config;