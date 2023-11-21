import React from "react";
import { navigateTo } from "../../../store/actions/navigation";
import {
  SidebarHeading,
  SidebarDivider,
  SidebarParagraph,
  Bold,
  LabelHint,
  InputAppendageButton
} from "../../../Components/multipart-form/elements.styles";

const config = {
  id: "account_slide",
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
      onKeyDown: (event, helpers) => { event.persist(); helpers.checkEmail(event); },
      validation_error: (stateRetreiver) => stateRetreiver("email_error") ? <LabelHint error={!stateRetreiver("email_valid") ? 1 : 0} success={stateRetreiver("email_valid") ? 1 : 0}>{stateRetreiver("email_error")}</LabelHint> : null,
      input_appendage: (stateRetriever, helpers, stateConsumer) => stateRetriever("error_code") === "email_in_use" ? <InputAppendageButton type="button" small nomargin margintop={10} danger onClick={() => helpers.claimThisEmail(stateRetriever("email"))}>Claim Email</InputAppendageButton> : null
    }
  ],
  sidebar: (stateRetriever) => (
    <>
      <SidebarHeading>
        <Bold>Fulfilling the daily requirements of a loved one with special needs</Bold> requires more than any one caregiver can offer – <Bold>it takes a village, and it takes a plan.</Bold>
      </SidebarHeading>
      <SidebarDivider />
      <SidebarParagraph>Hope Trust’s revolutionary technology enables you to develop a comprehensive care plan that can be updated anytime, anywhere.</SidebarParagraph>
    </>
  ),
  cta: {
    actionLabel: () => "Submit"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      const source = helpers.location.query.source || "";
      if (helpers.location.query.utm_source) stateConsumer("utm_source", decodeURIComponent(helpers.location.query.utm_source), "registration_config");
      if (helpers.location.query.utm_medium) stateConsumer("utm_medium", decodeURIComponent(helpers.location.query.utm_medium), "registration_config");
      if (helpers.location.query.utm_campaign) stateConsumer("utm_campaign", decodeURIComponent(helpers.location.query.utm_campaign), "registration_config");
      if (helpers.location.query.utm_content) stateConsumer("utm_content", decodeURIComponent(helpers.location.query.utm_content), "registration_config");
      if (helpers.location.query.hsa_ad) stateConsumer("hsa_ad", decodeURIComponent(helpers.location.query.hsa_ad), "registration_config");
      if (helpers.location.query.cta_origin) stateConsumer("cta_origin", decodeURIComponent(helpers.location.query.cta_origin), "registration_config");
      if (helpers.location.query.firstname) stateConsumer("first_name", decodeURIComponent(helpers.location.query.firstname.replace(/\+/g, " ")), "client_details");
      if (helpers.location.query.lastname) stateConsumer("last_name", decodeURIComponent(helpers.location.query.lastname.replace(/\+/g, " ")), "client_details");
      if (helpers.location.query.email) stateConsumer("email", decodeURIComponent(helpers.location.query.email), "client_details");
      if (helpers.location.query.email && !stateRetriever("is_loading_email") && source !== "gmail") helpers.check(decodeURIComponent(helpers.location.query.email));
      if (helpers.location.query.phone) stateConsumer("home_phone", decodeURIComponent(helpers.location.query.phone), "client_details");
      if (helpers.location.query.address) stateConsumer("address", decodeURIComponent(helpers.location.query.address.replace(/\+/g, " ")), "client_details");
      if (helpers.location.query.address2) stateConsumer("address2", decodeURIComponent(helpers.location.query.address2.replace(/\+/g, " ")), "client_details");
      if (helpers.location.query.city) stateConsumer("city", decodeURIComponent(helpers.location.query.city.replace(/\+/g, " ")), "client_details");
      if (helpers.location.query.state) stateConsumer("state", decodeURIComponent(helpers.location.query.state.replace(/\+/g, " ")), "client_details");
      if (helpers.location.query.zip) stateConsumer("zip", decodeURIComponent(helpers.location.query.zip), "client_details");
      if (helpers.location.query.referral_code) stateConsumer("referral_code", decodeURIComponent(helpers.location.query.referral_code), "preserved_details");
      if (helpers.location.query.invite_code) stateConsumer("invite_code", decodeURIComponent(helpers.location.query.invite_code), "preserved_details");
      if (helpers.location.query.gender) stateConsumer("gender", decodeURIComponent(helpers.location.query.gender), "client_details");
      if (helpers.location.query.is_benefits) stateConsumer("is_benefits", (helpers.location.query.is_benefits === "true" ? true : false), "preserved_details");
      if (helpers.location.query.pronouns) stateConsumer("pronouns", decodeURIComponent(helpers.location.query.pronouns), "client_details");
      if (helpers.location.query.birthday) stateConsumer("birthday", decodeURIComponent(helpers.location.query.birthday), "client_details");
      if (helpers.location.query.organization) stateConsumer("organization", decodeURIComponent(helpers.location.query.organization.replace(/\+/g, " ")), "preserved_details");
      window.history.pushState({}, document.title, window.location.pathname);
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => !stateRetriever("primary_contact_created") ? helpers.createHubspotContact("In Progress") : helpers.updateHubspotContact("In Progress"),
    shouldRender: (stateRetriever) => true
  }
};

export default config;