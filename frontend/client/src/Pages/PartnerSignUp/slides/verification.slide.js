import React from "react";
import {
  Bold,
  MobileMessage,
  SlideTitle
} from "../../../Components/multipart-form/elements.styles";
import AuthTimer from "../../../Components/AuthTimer";
import { cancelSignup } from "../../../store/actions/user";
import { resendSignUp } from "../../../store/actions/signup";


const config = {
  id: "verification_slide",
  title: (stateRetriever) => <SlideTitle>Verify Your Email Address<br /><MobileMessage>A verification code has been sent to <Bold>{stateRetriever("email")}</Bold>, please enter this code and click <Bold>Verify</Bold></MobileMessage></SlideTitle>,
  collector: "registration_config",
  secondaryCta: {
    position: "right",
    label: "Resend Code",
    action: (stateRetriever) => resendSignUp(stateRetriever("email"))
  },
  form: [
    {
      input_key: "verification_field",
      id: "verification_code",
      label: "Verification Code",
      type: (stateRetriever) => "text",
      required: true,
      maxLength: 6,
      validators: [
        (str) => /\b\d{6}\b/g.test(str)
      ],
      input_appendage: (stateRetriever, helpers) => <AuthTimer initial_seconds={300} cancel={() => helpers.cancelSignup(stateRetriever("email"))} />
    }
  ],
  previousAction: (stateRetriever) => cancelSignup(stateRetriever("email")),
  cta: {
    actionLabel: () => "Verify",
    haltNext: (stateRetriever) => true
  },
  lifecycle: {
    onLoad: () => window.history.pushState({}, document.title, window.location.pathname),
    onSubmit: (stateRetriever, stateConsumer, helpers) => helpers.runRegisterAccount(stateRetriever("verification_code")),
    shouldRender: (stateRetriever) => stateRetriever("is_verifying")
  }
};

export default config;