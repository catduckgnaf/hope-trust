import { US_STATES } from "../../../utilities";

const STATES = US_STATES.map((state) => {
  return { value: state.name, label: state.name };
});

const config = {
  id: "address_slide",
  title: (stateRetriever) => `Where Does ${stateRetriever("first_name")} Live?`,
  collector: "account_details",
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
  cta: {
    actionLabel: (stateRetriever) => "Next"
  },
  lifecycle: {
    onLoad: () => null,
    onSubmit: async (stateRetriever, stateConsumer, helpers) => helpers.updateHubspotContact("In Progress"),
    shouldRender: (stateRetriever) => stateRetriever("user_type") !== "beneficiary"
  }
};

export default config;