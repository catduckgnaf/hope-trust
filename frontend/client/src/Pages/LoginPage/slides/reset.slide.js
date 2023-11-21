import React from "react";
import AuthTimer from "../../../Components/AuthTimer";
import { RevealPassword } from "../../../global-components";
import PasswordStrengthBar from "react-password-strength-bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LabelHint
} from "../../../Components/multipart-form/elements.styles";

const config = {
  id: "address_slireset_slidede",
  title: (stateRetriever) => "Reset Password",
  collector: "reset_details",
  secondaryCta: {
    position: "left",
    label: "Cancel",
    helper: (stateRetriever, helpers) => helpers.setFlow("login", true)
  },
  form: [
    {
      input_key: "reset_email_field",
      id: "reset_email",
      label: "Email",
      type: (stateRetriever) => "email",
      required: true,
      hint: "",
      validators: [
        (str) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(str)
      ],
      onValid: (stateRetriever, stateConsumer, helpers) => stateConsumer("reset_email_valid", true, "reset_details"),
      onInvalid: (stateRetriever, stateConsumer, helpers) => stateConsumer("reset_email_valid", false, "reset_details"),
      disableIf: (stateRetriever) => stateRetriever("email_verified")
    },
    {
      input_key: "reset_verification_field",
      id: "reset_verification_code",
      label: "Verification Code",
      type: (stateRetriever) => "text",
      autoComplete: "new-password",
      required: true,
      maxLength: 6,
      validators: [
        (str) => /\b\d{6}\b/g.test(str)
      ],
      renderInput: (stateRetriever) => stateRetriever("email_verified"),
      input_appendage: (stateRetriever, helpers) => <AuthTimer initial_seconds={300} cancel={() => helpers.setFlow("login")} />
    },
    {
      input_key: "reset_password_field",
      local: true,
      autoComplete: "new-password",
      id: "reset_password",
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
      input_key: "reset_confirm_password_field",
      local: true,
      autoComplete: "new-password",
      id: "reset_confirmPassword",
      label: "Confirm Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: true,
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str),
        (str, stateRetriever) => str === stateRetriever("reset_password", true)
      ],
      renderInput: (stateRetriever) => stateRetriever("email_verified"),
      maxLength: 36,
      minLength: 8,
      validation_error: (stateRetreiver) => {
        const is_matching = stateRetreiver("reset_password", true) === stateRetreiver("reset_confirmPassword", true);
        return (stateRetreiver("reset_password", true) && stateRetreiver("reset_confirmPassword", true)) ? <LabelHint error={!is_matching ? 1 : 0} success={is_matching ? 1 : 0}>{!is_matching ? "Passwords do not match" : "Passwords match!"}</LabelHint> : null;
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            <RevealPassword top={40} onClick={() => stateConsumer("revealed", !stateRetriever("revealed"), "reset_details")}><FontAwesomeIcon icon={["fad", stateRetriever("revealed") ? "eye-slash" : "eye"]} /></RevealPassword>
            <PasswordStrengthBar password={stateRetriever("reset_password", true)} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={8} />
          </>
        );
      }
    }
  ],
  cta: {
    actionLabel: (stateRetriever) => "Save",
    haltNext: () => true,
    hideNext: (stateRetriever) => !stateRetriever("email_verified"),
    additionalButton: {
      actionLabel: () => "Submit",
      action: (stateRetriever, stateConsumer, helpers) => helpers.runVerification(stateRetriever("reset_email")),
      hide: (stateRetriever) => stateRetriever("email_verified"),
      disabled: (stateRetriever) => !stateRetriever("reset_email_valid")
    }
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      if (helpers.location.query.email) {
        stateConsumer("reset_email", decodeURIComponent(helpers.location.query.email), "reset_details");
        stateConsumer("reset_email_valid", true, "reset_details");
      }
      window.history.pushState({}, document.title, "/reset-password");
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => helpers.confirmForgotPassword(stateRetriever("reset_email"), stateRetriever("reset_verification_code"), stateRetriever("reset_password", true)),
    shouldRender: (stateRetriever) => stateRetriever("flow", true) === "reset"
  }
};

export default config;