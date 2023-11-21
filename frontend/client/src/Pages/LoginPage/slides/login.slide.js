import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FormButton,
  LabelHint, SlideTitle, SlideTitleButtonContainer
} from "../../../Components/multipart-form/elements.styles";
import { InputLabel, RevealPassword } from "../../../global-components";
import { retrieveReduxState } from "../../../store/actions/utilities";

const config = {
  id: "login_slide",
  title: (stateRetriever, helpers) => {
    return (
      <div>
        <SlideTitle marginbottom={30}>Login</SlideTitle>
        <SlideTitleButtonContainer>
          <FormButton secondary onClick={() => {
            helpers.clearRegistrations();
            helpers.navigateTo("/client-registration");
          }} radius={6} blue>Client Registration</FormButton>
          <FormButton secondary onClick={() => {
            helpers.clearRegistrations();
            helpers.navigateTo("/partner-registration");
          }} radius={6} blue>Partner Registration</FormButton>
        </SlideTitleButtonContainer>
      </div>
    );
  },
  collector: "login_details",
  secondaryCta: {
    position: "right",
    label: "Forgot Password?",
    helper: (stateRetriever, helpers) => helpers.setFlow("forgot")
  },
  containerLink: (stateRetriever, helpers) => {
    const cs = retrieveReduxState("customer_support");
    return (
      <InputLabel margintop={10}>Version: {cs.core_settings && cs.core_settings.client_app_version ? cs.core_settings.client_app_version : "1.0"}</InputLabel>
    );
  },
  form: [
    {
      input_key: "login_email_field",
      id: "login_email",
      label: "Email",
      type: (stateRetriever) => "email",
      required: false,
      autoFill: false,
      placeholder: "Enter your email...",
      hint: "",
      validators: [
        (str) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(str)
      ],
      autoComplete: "on",
      validation_error: (stateRetreiver) => stateRetreiver("email_error") ? <LabelHint error>{stateRetreiver("email_error")}</LabelHint> : null
    },
    {
      input_key: "login_password_field",
      local: true,
      id: "login_password",
      label: "Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: false,
      autoFill: false,
      autoComplete: "on",
      placeholder: "••••••••",
      hint: "",
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str)
      ],
      maxLength: 36,
      minLength: 8,
      validation_error: (stateRetreiver) => "",
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return <RevealPassword top={40} onClick={() => stateConsumer("revealed", !stateRetriever("revealed"), "login_config")}><FontAwesomeIcon icon={["fad", stateRetriever("revealed") ? "eye-slash" : "eye"]} /></RevealPassword>;
      }
    },
  ],
  cta: {
    actionLabel: () => "Login"
  },
  lifecycle: {
    onLoad: async (stateConsumer, helpers, stateRetriever) => {
      if (helpers.location.query.flow) stateConsumer("flow", decodeURIComponent(helpers.location.query.flow), true);
      if (helpers.location.query.email) {
        stateConsumer("login_email", decodeURIComponent(helpers.location.query.email), "login_details");
        stateConsumer("forgot_email", decodeURIComponent(helpers.location.query.email), "forgot_details");
        stateConsumer("reset_email", decodeURIComponent(helpers.location.query.email), "reset_details");
        stateConsumer("force_email", decodeURIComponent(helpers.location.query.email), "force_details");
        stateConsumer("resolve_email", decodeURIComponent(helpers.location.query.email), "resolve_details");
        stateConsumer("forgot_email_valid", true, "forgot_details");
        stateConsumer("reset_email_valid", true, "reset_details");
      }
      helpers.getCoreSettings(true);
      window.history.pushState({}, document.title, "/login");
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => await helpers.login({ email: stateRetriever("login_email") }),
    shouldRender: (stateRetriever) => stateRetriever("flow", true) === "login"
  }
};

export default config;