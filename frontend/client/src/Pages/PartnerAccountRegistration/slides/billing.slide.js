import React from "react";
import { retrieveReduxState } from "../../../store/actions/utilities";
import { StripeBillingForm } from "../../../Components/StripeBillingForm";
import StripeElementsWrapper from "../../../Components/StripeElementsWrapper";

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
    (stateRetriever) => stateRetriever("token")
  ],
  cta: {
    actionLabel: (stateRetriever) => "Next",
    action: (stateRetriever, stateConsumer, helpers) => {
      const slide = retrieveReduxState("multi_part_form").slide;
      if (stateRetriever("token")) helpers.changeFormSlide(slide + 1);
      helpers.stepComplete("billing_slide", true);
    },
    haltNext: () => true,
    hideNext: (stateRetriever) => !stateRetriever("token"),
    additionalButton: {
      actionLabel: () => "Save Payment Method",
      action: (stateRetriever, stateConsumer, helpers) => stateConsumer("payment_method_created", true, "registration_config"),
      hide: (stateRetriever) => !!stateRetriever("token"),
      disabled: (stateRetriever) => {
        if (stateRetriever("is_creating_token")) return true;
        const fields = [
          stateRetriever("card_name"),
          stateRetriever("card_number"),
          stateRetriever("card_exp"),
          stateRetriever("card_cvc"),
          (stateRetriever("card_zip") && (stateRetriever("card_zip").length === 5))
        ];
        if (fields.some((f) => !f)) return true;
      }
    }
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      stateConsumer("payment_method_created", false, "registration_config");
      helpers.getStripeExpandedCustomer(false, retrieveReduxState("user").customer_id);
      helpers.stepComplete("billing_slide", false);
    },
    onUnload: (stateConsumer, helpers, stateRetriever) => stateConsumer("is_creating_token", false, "registration_config"),
    onSubmit: async (stateRetriever, stateConsumer, helpers) => null,
    shouldRender: (stateRetriever) => {
      const user = retrieveReduxState("user");
      const plan_choice = stateRetriever("plan_choice") || retrieveReduxState("plans").active_partner_plans.find((p) => p.name === user.partner_data.plan_type);
      return plan_choice && plan_choice.monthly && stateRetriever("authorized");
    }
  }
};

export default config;