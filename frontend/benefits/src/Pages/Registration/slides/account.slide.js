import React from "react";
import { navigateTo } from "../../../store/actions/navigation";
import {
  LabelHint,
  InputAppendageButton
} from "../../../Components/multipart-form/elements.styles";
import { formatUSPhoneNumberPretty, formatUSPhoneNumber } from "../../../utilities";

const config = {
  id: "account_info",
  title: (stateRetriever) => "Get Started",
  collector: "client_details",
  secondaryCta: {
    position: "right",
    label: "Already have an account?",
    action: () => navigateTo("/login")
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
      required: true,
      hint: "you must have access to this email",
      validators: [
        (str) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(str),
        (str, stateRetreiver) => stateRetreiver("email_valid")
      ],
      onKeyDown: (event, helpers) => helpers.checkEmail(event),
      validation_error: (stateRetreiver) => stateRetreiver("email_error") ? <LabelHint error={!stateRetreiver("email_valid") ? 1 : 0} success={stateRetreiver("email_valid") ? 1 : 0}>{stateRetreiver("email_error")}</LabelHint> : null,
      input_appendage: (stateRetriever, helpers, stateConsumer) => stateRetriever("error_code") === "email_in_use" ? <InputAppendageButton type="button" small rounded nomargin margintop={10} outline danger onClick={() => helpers.claimThisEmail(stateRetriever("email"))}>Claim Email</InputAppendageButton> : null
    },
    {
      input_key: "phone_field",
      id: "home_phone",
      label: "Phone Number",
      type: (stateRetriever) => "tel",
      required: true,
      placeholder: "xxx xxx-xxxx",
      onKeyUp: (event, helpers, stateConsumer) => {
        stateConsumer("home_phone", formatUSPhoneNumber(event.target.value), "client_details");
        event.target.value = formatUSPhoneNumberPretty(event.target.value);
      },
      valueFormatter: (value) => formatUSPhoneNumberPretty(value),
      validators: [
        (str) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(str)
      ]
    }
  ],
  cta: {
    actionLabel: () => "Submit"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      if (helpers.location.query.utm_source) stateConsumer("utm_source", decodeURIComponent(helpers.location.query.utm_source), "registration_config");
      if (helpers.location.query.utm_medium) stateConsumer("utm_medium", decodeURIComponent(helpers.location.query.utm_medium), "registration_config");
      if (helpers.location.query.utm_campaign) stateConsumer("utm_campaign", decodeURIComponent(helpers.location.query.utm_campaign), "registration_config");
      if (helpers.location.query.utm_content) stateConsumer("utm_content", decodeURIComponent(helpers.location.query.utm_content), "registration_config");
      if (helpers.location.query.hsa_ad) stateConsumer("hsa_ad", decodeURIComponent(helpers.location.query.hsa_ad), "registration_config");
      if (helpers.location.query.cta_origin) stateConsumer("cta_origin", decodeURIComponent(helpers.location.query.cta_origin), "registration_config");
      if (helpers.location.query.firstname) stateConsumer("first_name", decodeURIComponent(helpers.location.query.firstname), "client_details");
      if (helpers.location.query.lastname) stateConsumer("last_name", decodeURIComponent(helpers.location.query.lastname), "client_details");
      if (helpers.location.query.email) stateConsumer("email", decodeURIComponent(helpers.location.query.email), "client_details");
      if (helpers.location.query.email && !stateRetriever("is_loading_email")) helpers.checkEmail(null, decodeURIComponent(helpers.location.query.email));
      if (helpers.location.query.phone) stateConsumer("home_phone", decodeURIComponent(helpers.location.query.phone), "client_details");
      if (helpers.location.query.address) stateConsumer("address", decodeURIComponent(helpers.location.query.address), "client_details");
      if (helpers.location.query.address2) stateConsumer("address2", decodeURIComponent(helpers.location.query.address2), "client_details");
      if (helpers.location.query.city) stateConsumer("city", decodeURIComponent(helpers.location.query.city), "client_details");
      if (helpers.location.query.state) stateConsumer("state", decodeURIComponent(helpers.location.query.state), "client_details");
      if (helpers.location.query.zip) stateConsumer("zip", decodeURIComponent(helpers.location.query.zip), "client_details");
      if (helpers.location.query.gender) stateConsumer("gender", decodeURIComponent(helpers.location.query.gender), "client_details");
      if (helpers.location.query.pronouns) stateConsumer("pronouns", decodeURIComponent(helpers.location.query.pronouns), "client_details");
      if (helpers.location.query.birthday) stateConsumer("birthday", decodeURIComponent(helpers.location.query.birthday), "client_details");
      window.history.pushState({}, document.title, window.location.pathname);
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => !stateRetriever("primary_contact_created") ? helpers.createHubspotContact("In Progress") : helpers.updateHubspotContact("In Progress"),
    shouldRender: (stateRetriever) => true
  }
};

export default config;