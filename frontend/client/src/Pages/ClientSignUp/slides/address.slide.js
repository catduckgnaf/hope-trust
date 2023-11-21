import React from "react";
import {
  SidebarSubheading,
  SidebarHeading,
  SidebarDivider,
  Semibold
} from "../../../Components/multipart-form/elements.styles";
import { US_STATES } from "../../../utilities";

const STATES = US_STATES.map((state) => {
  return { value: state.name, label: state.name };
});

const config = {
  id: "address_slide",
  title: (stateRetriever) => "Address Information",
  collector: "client_details",
  form: [
    {
      input_key: "address_field",
      id: "address",
      label: "Address",
      type: (stateRetriever) => "text",
      required: true
    },
    { 
      input_key: "address2_field",
      id: "address2",
      label: "Address 2",
      type: (stateRetriever) => "text",
      required: false
    },
    { 
      input_key: "city_field",
      id: "city",
      label: "City",
      type: (stateRetriever) => "text",
      required: true
    },
    [
      { 
        input_key: "state_field",
        id: "state",
        label: "State",
        type: (stateRetriever) => "selection",
        required: true,
        options: STATES
      },
      { 
        input_key: "zip_field",
        id: "zip",
        label: "Zip Code",
        type: (stateRetriever) => "text",
        required: true,
        maxLength: 5,
        validators: [
          (str) => /\b\d{5}\b/g.test(str)
        ]
      }
    ]
  ],
  sidebar: (stateRetriever) => (
    <>
      <SidebarSubheading>From day-to-day tasks like paying bills and scheduling doctors’ appointments, to managing trust distributions and resolving emergency situations, we are here to provide a lifetime of support.</SidebarSubheading>
      <SidebarDivider />
      <SidebarHeading>
        <Semibold>Because we get it, and once your plan is created, we'll get you.</Semibold>
      </SidebarHeading>
    </>
  ),
  cta: {
    actionLabel: () => "Next"
  },
  lifecycle: {
    onLoad: () => window.history.pushState({}, document.title, window.location.pathname),
    onSubmit: async (stateRetriever, stateConsumer, helpers) => helpers.updateHubspotContact("In Progress"),
    shouldRender: (stateRetriever) => true
  }
};

export default config;