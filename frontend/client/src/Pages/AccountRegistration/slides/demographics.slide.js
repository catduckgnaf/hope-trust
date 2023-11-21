import { formatUSPhoneNumberPretty, formatUSPhoneNumber } from "../../../utilities";
import { retrieveReduxState } from "../../../store/actions/utilities";
import moment from "moment";

const config = {
  id: "demographics_slide",
  title: (stateRetriever) => "Demographic Information",
  collector: "account_details",
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
      required: false,
      placeholder: "xxx xxx-xxxx",
      onKeyUp: (event, helpers, stateConsumer) => {
        stateConsumer("home_phone", formatUSPhoneNumber(event.target.value), "account_details");
        event.target.value = formatUSPhoneNumberPretty(event.target.value);
      },
      valueFormatter: (value) => formatUSPhoneNumberPretty(value),
      validators: [
        (str) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(str)
      ]
    }
  ],
  cta: {
    actionLabel: (stateRetriever) => (stateRetriever("is_benefits") || retrieveReduxState("user").benefits_client_config) ? "Next" : "Register",
    haltNext: (stateRetriever) => (stateRetriever("is_benefits") || retrieveReduxState("user").benefits_client_config) ? false : true
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers) => null,
    onSubmit: async (stateRetriever, stateConsumer, helpers) => (stateRetriever("is_benefits") || retrieveReduxState("user").benefits_client_config) ? null : await helpers.runRegisterAccount(),
    shouldRender: (stateRetriever) => stateRetriever("user_type") !== "beneficiary"
  }
};

export default config;