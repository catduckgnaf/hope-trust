import React from "react";
import AuthTimer from "../../../Components/AuthTimer";
import { RevealPassword } from "../../../global-components";
import PasswordStrengthBar from "react-password-strength-bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LabelHint
} from "../../../Components/multipart-form/elements.styles";

const config = {
  id: "address_sliforgot_slidede",
  title: (stateRetriever) => "Forgot Password",
  collector: "forgot_details",
  secondaryCta: {
    position: "left",
    label: "Cancel",
    helper: (stateRetriever, helpers) => helpers.setFlow("login", true)
  },
  form: [
    {
      input_key: "forgot_email_field",
      id: "forgot_email",
      label: "Email",
      type: (stateRetriever) => "email",
      autoComplete: "new-password",
      placeholder: "Enter your email...",
      required: true,
      hint: "",
      validators: [
        (str) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(str)
      ],
      onValid: (stateRetriever, stateConsumer, helpers) => stateConsumer("forgot_email_valid", true, "forgot_details"),
      onInvalid: (stateRetriever, stateConsumer, helpers) => stateConsumer("forgot_email_valid", false, "forgot_details"),
      disableIf: (stateRetriever) => stateRetriever("email_verified")
    },
    {
      input_key: "forgot_verification_field",
      id: "forgot_verification_code",
      label: "Verification Code",
      type: (stateRetriever) => "text",
      autoComplete: "new-password",
      required: true,
      maxLength: 6,
      validators: [
        (str) => /\b\d{6}\b/g.test(str)
      ],
      renderInput: (stateRetriever) => stateRetriever("email_verified"),
      onValid: (stateRetriever, stateConsumer, helpers) => stateConsumer("forgot_code_verified", true, "forgot_details"),
      onInvalid: (stateRetriever, stateConsumer, helpers) => stateConsumer("forgot_code_verified", false, "forgot_details"),
      input_appendage: (stateRetriever, helpers) => <AuthTimer initial_seconds={300} cancel={() => helpers.setFlow("login")} />
    },
    {
      input_key: "forgot_password_field",
      local: true,
      autoComplete: "new-password",
      id: "forgot_password",
      label: "Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: true,
      hint: "at least 8 characters, 1 number, 1 uppercase",
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str)
      ],
      renderInput: (stateRetriever) => stateRetriever("email_verified"),
      maxLength: 36,
      minLength: 8
    },
    {
      input_key: "forgot_confirm_password_field",
      local: true,
      autoComplete: "new-password",
      id: "forgot_confirmPassword",
      label: "Confirm Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: true,
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str),
        (str, stateRetriever) => str === stateRetriever("forgot_password", true)
      ],
      renderInput: (stateRetriever) => stateRetriever("email_verified"),
      maxLength: 36,
      minLength: 8,
      validation_error: (stateRetreiver) => {
        const is_matching = stateRetreiver("forgot_password", true) === stateRetreiver("forgot_confirmPassword", true);
        return (stateRetreiver("forgot_password", true) && stateRetreiver("forgot_confirmPassword", true)) ? <LabelHint error={!is_matching ? 1 : 0} success={is_matching ? 1 : 0}>{!is_matching ? "Passwords do not match" : "Passwords match!"}</LabelHint> : null;
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            <RevealPassword top={40} onClick={() => stateConsumer("revealed", !stateRetriever("revealed"), "forgot_details")}><FontAwesomeIcon icon={["fad", stateRetriever("revealed") ? "eye-slash" : "eye"]} /></RevealPassword>
            <PasswordStrengthBar password={stateRetriever("forgot_password", true)} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={8} />
          </>
        );
      }
    }
  ],
  cta: {
    actionLabel: (stateRetriever) => "Submit",
    haltNext: (stateRetriever) => stateRetriever("forgot_code_verified") ? true : false,
    hideNext: (stateRetriever) => stateRetriever("email_verified"),
    additionalButton: {
      actionLabel: (stateRetriever) => !stateRetriever("forgot_code_verified") ? "Resend" : "Save Password",
      action: (stateRetriever, stateConsumer, helpers) => {
        if (stateRetriever("forgot_code_verified") && stateRetriever("forgot_verification_code")) {
          helpers.confirmForgotPassword(stateRetriever("forgot_email"), stateRetriever("forgot_verification_code"), stateRetriever("forgot_password", true))
        } else {
          helpers.runVerification(stateRetriever("forgot_email"));
        }
      },
      hide: (stateRetriever) => !stateRetriever("email_verified"),
      disabled: (stateRetriever) => !stateRetriever("forgot_code_verified") ? false : ((!stateRetriever("forgot_password", true) || !stateRetriever("forgot_confirmPassword", true)) || stateRetriever("forgot_password", true) !== stateRetriever("forgot_confirmPassword", true))
    }
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      if (helpers.location.query.email || stateRetriever("forgot_email")) {
        if (helpers.location.query.email) stateConsumer("forgot_email", decodeURIComponent(helpers.location.query.email), "forgot_details");
        stateConsumer("forgot_email_valid", true, "forgot_details");
      }
      window.history.pushState({}, document.title, "/forgot-password");
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => !stateRetriever("forgot_code_verified") ? helpers.runVerification(stateRetriever("forgot_email")) : null,
    shouldRender: (stateRetriever) => stateRetriever("flow", true) === "forgot"
  }
};

export default config;