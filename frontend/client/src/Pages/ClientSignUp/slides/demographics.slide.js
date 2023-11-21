import moment from "moment";
import React from "react";
import {
  SidebarBlackHeading,
  SidebarDivider,
  SidebarParagraph
} from "../../../Components/multipart-form/elements.styles";
import { formatUSPhoneNumberPretty, formatUSPhoneNumber } from "../../../utilities";

const config = {
  id: "demographics_slide",
  title: (stateRetriever) => "About You",
  collector: "client_details",
  form: [
    [
      {
        input_key: "gender_field",
        id: "gender",
        label: "Gender at Birth",
        required: true,
        type: (stateRetriever) => "selection",
        options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
          { label: "Intersex", value: "intersex" }
        ]
      },
      {
        input_key: "pronouns_field",
        id: "pronouns",
        label: "Preferred Pronouns",
        required: true,
        type: (stateRetriever) => "selection",
        options: [
          { label: "She, Her, Hers", value: "female-pronoun" },
          { label: "He, Him, His", value: "male-pronoun" },
          { label: "They, Them, Theirs", value: "nongender-pronoun" }
        ]
      }
    ],
    {
      input_key: "birthday_field",
      id: "birthday",
      label: "Birthday",
      type: (stateRetriever) => "date",
      required: true,
      minDate: "1920-01-01",
      maxDate: new Date(),
      valueFormatter: (value) => moment(value).utc().format("YYYY-MM-DD")
    },
    {
      input_key: "home_phone_field",
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
  sidebar: (stateRetriever) => (
    <>
      <SidebarBlackHeading>Protect Your<br />Loved Ones</SidebarBlackHeading>
      <SidebarDivider />
      <SidebarParagraph>Hope Trust was founded as a labor of love by people just like you who are concerned about the quality and affordability of care for individuals with special needs. Our free and paid care plans have been designed to give you tiers of care and information so that your loved ones with challenges can receive personalized treatment to let them live a rich, full life.</SidebarParagraph>
    </>
  ),
  cta: {
    actionLabel: () => "Next"
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers) => window.history.pushState({}, document.title, window.location.pathname),
    onSubmit: (stateRetriever, stateConsumer, helpers) => helpers.updateHubspotContact("In Progress"),
    shouldRender: (stateRetriever) => true
  }
};

export default config;