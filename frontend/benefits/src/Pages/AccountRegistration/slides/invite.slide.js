import React from "react";
import {
  LabelHint
} from "../../../Components/multipart-form/elements.styles";
import authenticated from "../../../store/actions/authentication";
import { retrieveReduxState } from "../../../store/actions/utilities";

const config = {
  id: "invite_slide",
  title: (stateRetriever) => "Invite Entity",
  secondaryCta: {
    position: "right",
    label: "Log Out",
    action: () => authenticated.logOut()
  },
  collector: "registration_config",
  form: [
    {
      input_key: "invite_name_field",
      id: "name",
      label: "Organization",
      type: (stateRetriever) => "text",
      required: false,
      value: (stateRetriever) => stateRetriever("name"),
      disableIf: () => true
    },
    {
      input_key: "invite_first_field",
      id: "invite_first",
      label: "First Name",
      type: (stateRetriever) => "text",
      required: true
    },
    {
      input_key: "invite_last_field",
      id: "invite_last",
      label: "Last Name",
      type: (stateRetriever) => "text",
      required: true
    },
    {
      input_key: "invite_email_field",
      id: "invite_email",
      label: "Email",
      type: (stateRetriever) => "email",
      required: true,
      hint: "Invitee must have access to this email",
      validators: [
        (str) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(str),
        (str, stateRetreiver) => stateRetreiver("email_valid")
      ],
      onKeyUp: (event, helpers) => helpers.checkEmail(event),
      validation_error: (stateRetreiver) => stateRetreiver("email_error") ? <LabelHint error={!stateRetreiver("email_valid") ? 1 : 0} success={stateRetreiver("email_valid") ? 1 : 0}>{stateRetreiver("email_error")}</LabelHint> : null
    }
  ],
  cta: {
    actionLabel: () => "Submit",
    haltNext: (stateRetriever) => true
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => null,
    onSubmit: async (stateRetriever, stateConsumer, helpers) => helpers.sendEntityInvitation(),
    shouldRender: (stateRetriever) => {
      if (stateRetriever("user_type") === "agent") return false;
      if (retrieveReduxState("user").benefits_data && retrieveReduxState("user").benefits_data.status === "pending") return false;
      if (!stateRetriever("authorized") && (stateRetriever("account_type") === "new")) return true;
      return false;
    }
  }
};

export default config;