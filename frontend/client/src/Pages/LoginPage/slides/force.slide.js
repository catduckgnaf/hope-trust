import React from "react";
import { RevealPassword } from "../../../global-components";
import PasswordStrengthBar from "react-password-strength-bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LabelHint
} from "../../../Components/multipart-form/elements.styles";

const config = {
  id: "force_slide",
  title: (stateRetriever) => "Update Your Password",
  collector: "force_details",
  secondaryCta: {
    position: "left",
    label: "Cancel",
    helper: (stateRetriever, helpers) => helpers.setFlow("login", true)
  },
  form: [
    {
      input_key: "force_email_field",
      id: "force_email",
      label: "Email",
      type: (stateRetriever) => "email",
      value: (stateRetriever) => stateRetriever("login_email"),
      required: false,
      hint: "",
      validators: [
        (str) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(str)
      ],
      disableIf: () => true
    },
    {
      input_key: "force_password_field",
      local: true,
      autoComplete: "new-password",
      id: "force_password",
      label: "Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: true,
      hint: "at least 8 characters, 1 number, 1 uppercase",
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str)
      ],
      renderInput: (stateRetriever) => stateRetriever("login_email"),
      maxLength: 36,
      minLength: 8
    },
    {
      input_key: "force_confirm_password_field",
      local: true,
      autoComplete: "new-password",
      id: "force_confirmPassword",
      label: "Confirm Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: true,
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str),
        (str, stateRetriever) => str === stateRetriever("force_password", true)
      ],
      renderInput: (stateRetriever) => stateRetriever("login_email"),
      maxLength: 36,
      minLength: 8,
      validation_error: (stateRetreiver) => {
        const is_matching = stateRetreiver("force_password", true) === stateRetreiver("force_confirmPassword", true);
        return (stateRetreiver("force_password", true) && stateRetreiver("force_confirmPassword", true)) ? <LabelHint error={!is_matching ? 1 : 0} success={is_matching ? 1 : 0}>{!is_matching ? "Passwords do not match" : "Passwords match!"}</LabelHint> : null;
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            <RevealPassword top={40} onClick={() => stateConsumer("revealed", !stateRetriever("revealed"), "force_details")}><FontAwesomeIcon icon={["fad", stateRetriever("revealed") ? "eye-slash" : "eye"]} /></RevealPassword>
            <PasswordStrengthBar password={stateRetriever("force_password")} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={8} />
          </>
        );
      }
    }
  ],
  cta: {
    actionLabel: () => "Submit"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      if (helpers.location.query.email) {
        stateConsumer("force_email", decodeURIComponent(helpers.location.query.email), "force_details");
        stateConsumer("force_email_valid", true, "force_details");
      }
      window.history.pushState({}, document.title, "/force-password");
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => await helpers.completeNewPassword(stateRetriever("login_user")),
    shouldRender: (stateRetriever) => stateRetriever("flow", true) === "force"
  }
};

export default config;