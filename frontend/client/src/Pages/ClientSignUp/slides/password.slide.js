import React from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  SidebarHeading,
  SidebarDivider,
  SidebarParagraph,
  Bold,
  Italic,
  LabelHint
} from "../../../Components/multipart-form/elements.styles";
import { RevealPassword } from "../../../global-components";
import TermsOfServiceCheck from "../../../Components/TermsOfServiceCheck";

const config = {
  id: "password_slide",
  title: (stateRetriever) => "Create Your Password",
  collector: "client_details",
  form: [
    {
      input_key: "password_field",
      autoComplete: "new-password",
      id: "password",
      label: "Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: true,
      hint: "at least 8 characters, 1 number, 1 uppercase",
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str)
      ],
      maxLength: 36,
      minLength: 8
    },
    {
      input_key: "confirm_password_field",
      autoComplete: "new-password",
      id: "confirmPassword",
      label: "Confirm Password",
      type: (stateRetriever) => stateRetriever("revealed") ? "text" : "password",
      required: true,
      validators: [
        (str) => str.length >= 8,
        (str) => /\d/.test(str),
        (str) => /[A-Z]/.test(str),
        (str, stateRetriever) => str === stateRetriever("password")
      ],
      maxLength: 36,
      minLength: 8,
      validation_error: (stateRetreiver) => {
        const is_matching = stateRetreiver("password") === stateRetreiver("confirmPassword");
        return (stateRetreiver("password") && stateRetreiver("confirmPassword")) ? <LabelHint error={!is_matching ? 1 : 0} success={is_matching ? 1 : 0}>{!is_matching ? "Passwords do not match" : "Passwords match!"}</LabelHint> : null;
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            <RevealPassword top={40} onClick={() => stateConsumer("revealed", !stateRetriever("revealed"), "registration_config")}><FontAwesomeIcon icon={["fad", stateRetriever("revealed") ? "eye-slash" : "eye"]} /></RevealPassword>
            <PasswordStrengthBar password={stateRetriever("password")} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={8} />
          </>
        );
      }
    },
    {
      input_key: "terms_field",
      id: "terms_accepted",
      label: "Terms of Service",
      required: true,
      type: (stateRetriever) => "component",
      Component: (props) => {
        return <TermsOfServiceCheck title="Terms of Service" setNewState={(key, value) => props.stateConsumer(key, value, "registration_config")} accepted={props.stateRetriever("terms_accepted")} id="terms_accepted" url="https://www.hopetrust.com/terms-of-service/" />;
      }
    },
    {
      input_key: "saas_field",
      id: "SAAS_accepted",
      label: "Software as a Service Agreement",
      required: true,
      type: (stateRetriever) => "component",
      Component: (props) => {
        return <TermsOfServiceCheck title="Software as a Service Agreement" setNewState={(key, value) => props.stateConsumer(key, value, "registration_config")} accepted={props.stateRetriever("SAAS_accepted")} id="SAAS_accepted" url="https://www.hopetrust.com/saas-agreement/" />;
      }
    }
  ],
  sidebar: (stateRetriever) => (
    <>
      <SidebarHeading>
        <Italic>
          <Bold>"While my job of helping keep my daughter healthy will never be over, this living care plan assures that when I can’t be there, <Bold>someone else will.</Bold>"</Bold>
        </Italic>
      </SidebarHeading>
      <SidebarDivider />
      <SidebarParagraph>- Hope Trust Client</SidebarParagraph>
    </>
  ),
  cta: {
    actionLabel: () => "Register"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => window.history.pushState({}, document.title, window.location.pathname),
    onSubmit: async (stateRetriever, stateConsumer, helpers) => await helpers.runRegisterClient(),
    shouldRender: (stateRetriever) => true
  }
};

export default config;