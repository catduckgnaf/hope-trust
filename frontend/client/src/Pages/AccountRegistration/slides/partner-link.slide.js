import React from "react";
import {
  SlideTitle,
  LabelHint,
  InputAppendageButton
} from "../../../Components/multipart-form/elements.styles";
import authenticated from "../../../store/actions/authentication";
import { retrieveReduxState } from "../../../store/actions/utilities";


const config = {
  id: "partner_link_slide",
  title: (stateRetriever) => <SlideTitle>Do You Have A Referral Code?</SlideTitle>,
  collector: "account_details",
  secondaryCta: {
    position: "right",
    label: "Sign Out",
    action: () => authenticated.logOut()
  },
  form: [
    {
      input_key: "referral_code_field",
      id: "referral_code",
      label: "Referral Code",
      type: (stateRetriever) => "text",
      required: false,
      hint: "Enter your code and press Apply",
      validators: [],
      disableIf: (stateRetreiver) => stateRetreiver("referral_valid"),
      validation_error: (stateRetreiver) => stateRetreiver("referral_error") ? <LabelHint error={!stateRetreiver("referral_valid") ? 1 : 0} success={stateRetreiver("referral_valid") ? 1 : 0}>{stateRetreiver("referral_error")}</LabelHint> : null,
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        if (stateRetriever("referral_valid")) {
          return <InputAppendageButton type="button" small nomargin margintop={10} danger onClick={() => {
            stateConsumer("referral", null, "account_details");
            stateConsumer("referral_code", "", "account_details");
            stateConsumer("referral_valid", false, "registration_config");
            stateConsumer("referral_error", "", "registration_config");
          }}>Remove</InputAppendageButton>;
        } else if (stateRetriever("referral_code")) {
          return <InputAppendageButton type="button" small nomargin margintop={10} blue onClick={() => helpers.verifyReferral(stateRetriever("referral_code"))}>Apply</InputAppendageButton>;
        }
      }
    },
  ],
  cta: {
    actionLabel: (stateRetriever) => (!stateRetriever("referral_code") || !stateRetriever("referral_valid")) ? "Skip" : "Next"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      const preserved = retrieveReduxState("client_registration").preserved_details;
      if (preserved && Object.keys(preserved).length) {
        for (const key in preserved) {
          stateConsumer(key, preserved[key], "account_details");
          if (key === "referral_code" && !stateRetriever("referral_valid")) helpers.verifyReferral(preserved[key]);
        }
      }
    },
    onSubmit: () => null,
    shouldRender: (stateRetriever) => (!stateRetriever("is_benefits") && !retrieveReduxState("user").benefits_client_config)
  }
};

export default config;