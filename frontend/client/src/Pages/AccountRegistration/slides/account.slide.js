import React from "react";
import {
  FormInputGroup,
  FormCheckboxLabel,
  FormCheckboxLabelText,
  LabelHint
} from "../../../Components/multipart-form/elements.styles";
import authenticated from "../../../store/actions/authentication";
import { StyledFormCheckbox } from "../../../Components/multipart-form/form/inputs/styles";

const config = {
  id: "account_slide",
  title: (stateRetriever) => "About Your Loved One",
  collector: "account_details",
  secondaryCta: {
    position: "right",
    label: "Sign Out",
    action: () => authenticated.logOut()
  },
  form: [
    {
      input_key: "first_name_field",
      id: "first_name",
      label: "First Name",
      type: (stateRetriever) => "text",
      required: true
    },
    {
      input_key: "last_name_field",
      id: "last_name",
      label: "Last Name",
      type: (stateRetriever) => "text",
      required: true
    },
    {
      input_key: "email_field",
      id: "email",
      label: "Email",
      type: (stateRetriever) => "email",
      required: false,
      hint: "you must have access to this email",
      validators: [
        (str) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(str),
        (str, stateRetreiver) => stateRetreiver("email_valid")
      ],
      disableIf: (stateRetreiver) => stateRetreiver("no_email"),
      onKeyDown: (event, helpers) => helpers.checkEmail(event),
      validation_error: (stateRetreiver) => stateRetreiver("email_error") ? <LabelHint error={!stateRetreiver("email_valid") ? 1 : 0} success={stateRetreiver("email_valid") ? 1 : 0}>{stateRetreiver("email_error")}</LabelHint> : null,
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <FormInputGroup top={10}>
            {!stateRetriever("email_valid")
              ? (
                <FormCheckboxLabel htmlFor="no_email_checkbox">
                  <StyledFormCheckbox name="no_email_checkbox" type="checkbox" defaultChecked={stateRetriever("no_email")} onChange={(event) => stateConsumer("no_email", event.target.checked, "account_details")} />
                  <FormCheckboxLabelText>Beneficiary does not have an email address</FormCheckboxLabelText>
                </FormCheckboxLabel>
              )
              : (
                <FormCheckboxLabel htmlFor="send_email_checkbox">
                  <StyledFormCheckbox name="send_email_checkbox" type="checkbox" defaultChecked={stateRetriever("send_email")} onChange={(event) => stateConsumer("send_email", event.target.checked, "account_details")} />
                  <FormCheckboxLabelText>Send welcome email to Beneficiary?</FormCheckboxLabelText>
                </FormCheckboxLabel>
              )
            }
          </FormInputGroup>
        );
      }
    }
  ],
  cta: {
    actionLabel: (stateRetriever) => "Next"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers) => null,
    onSubmit: async (stateRetriever, stateConsumer, helpers) => !stateRetriever("secondary_contact_created") ? helpers.createHubspotContact("In Progress") : helpers.updateHubspotContact("In Progress"),
    shouldRender: (stateRetriever) => stateRetriever("user_type") !== "beneficiary"
  }
};

export default config;