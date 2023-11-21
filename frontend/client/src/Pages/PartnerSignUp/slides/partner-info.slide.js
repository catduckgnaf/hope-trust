import React from "react";
import {
  FormInputGroup,
  FormCheckboxLabel,
  FormCheckboxLabelText,
  InputAppendageButton
} from "../../../Components/multipart-form/elements.styles";
import { StyledFormCheckbox } from "../../../Components/multipart-form/form/inputs/styles";
import { formatUSPhoneNumberPretty, formatUSPhoneNumber } from "../../../utilities";
import { advisor_types } from "../../../store/actions/partner-registration";

const partner_types = advisor_types.map((type) => {
  return { value: type.name, label: type.alias };
});

const config = {
  id: "partner_info_slide",
  title: (stateRetriever) => "Partner Details",
  collector: "partner_details",
  form: [
    {
      input_key: "partner_type_field",
      id: "partner_type",
      label: "Partner Type",
      type: (stateRetriever) => "selection",
      required: true,
      options: partner_types,
      onChange: (value, helpers) => {
        helpers.searchReferrals("type", value, false);
        if (["ria", "bank_trust", "accountant"].includes(value)) helpers.getInsuranceNetworks("type", "insurance", false);
      },
      disableIf: (stateRetriever) => stateRetriever("domain_approved"),
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            <FormInputGroup top={10}>
              {["ria", "bank_trust", "accountant"].includes(stateRetriever("partner_type"))
                ? (
                  <FormCheckboxLabel htmlFor="is_life_insurance_affiliate">
                    <StyledFormCheckbox name="is_life_insurance_affiliate" type="checkbox" defaultChecked={stateRetriever("is_life_insurance_affiliate")} onChange={(event) => stateConsumer("is_life_insurance_affiliate", event.target.checked, "partner_details")} />
                    <FormCheckboxLabelText>Do you have a life insurance affiliation?</FormCheckboxLabelText>
                  </FormCheckboxLabel>
                )
                : null
              }
            </FormInputGroup>
          </>
        );
      }
    },
    {
      input_key: "name_field",
      id: "name",
      label: "Organization",
      placeholder: "Enter a new organization name...",
      type: (stateRetriever) => stateRetriever("is_creating_new_org") ? "text" : "selection",
      required: true,
      autoFocus: true,
      disableIf: (stateRetriever) => stateRetriever("domain_approved"),
      options: (stateRetriever) => stateRetriever("mapped"),
      onChange: (newValue, helpers, stateConsumer, stateRetriever) => {
        if (!stateRetriever("is_creating_new_org")) {
          const org = stateRetriever("mapped").find((org) => org.label === newValue);
          if (org) stateConsumer("hubspot_company_id", org.hubspot_company_id, "registration_config");
          else stateConsumer("hubspot_company_id", "", "registration_config");
        }
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            {!stateRetriever("is_new_org") && !stateRetriever("is_confirmed_org") && !stateRetriever("is_creating_new_org")
              ? <InputAppendageButton style={{ right: stateRetriever("is_creating_new_org") ? "10px" : "40px" }} type="button" small nomargin margintop={10} blue onClick={() => {
                stateConsumer("is_creating_new_org", true, "registration_config");
                stateConsumer("name", "", "partner_details");
              }}>Create New</InputAppendageButton>
              : null
            }
            {stateRetriever("is_creating_new_org") && !stateRetriever("name")
              ? <InputAppendageButton style={{ right: stateRetriever("is_creating_new_org") ? "10px" : "40px" }} type="button" small nomargin margintop={10} danger onClick={() => stateConsumer("is_creating_new_org", false, "registration_config")}>Cancel</InputAppendageButton>
              : null
            }
          </>
        );
      }
    },
    {
      input_key: "primary_network_field",
      id: "primary_network",
      label: "Primary Life Insurance Network",
      placeholder: "Enter a new primary life insurance network...",
      type: (stateRetriever) => stateRetriever("is_creating_new_primary_network") ? "text" : "selection",
      required: true,
      autoFocus: true,
      options: (stateRetriever) => stateRetriever("insurance_networks"),
      renderInput: (stateRetriever) => (["ria", "bank_trust", "accountant"].includes(stateRetriever("partner_type")) && stateRetriever("is_life_insurance_affiliate")),
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            {!stateRetriever("is_new_primary_network") && !stateRetriever("is_confirmed_primary_network") && !stateRetriever("is_creating_new_primary_network")
              ? <InputAppendageButton style={{ right: stateRetriever("is_creating_new_primary_network") ? "10px" : "40px" }} type="button" small nomargin margintop={10} blue onClick={() => {
                stateConsumer("is_creating_new_primary_network", true, "registration_config");
                stateConsumer("primary_network", "", "partner_details");
              }}>Create New</InputAppendageButton>
              : null
            }
            {stateRetriever("is_creating_new_primary_network") && !stateRetriever("primary_network")
              ? <InputAppendageButton style={{ right: stateRetriever("is_creating_new_primary_network") ? "10px" : "40px" }} type="button" small nomargin margintop={10} danger onClick={() => stateConsumer("is_creating_new_primary_network", false, "registration_config")}>Cancel</InputAppendageButton>
              : null
            }
          </>
        );
      }
    },
    {
      input_key: "home_phone_field",
      id: "home_phone",
      label: "Mobile Phone",
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
    },
    {
      input_key: "other_phone_field",
      id: "other_phone",
      label: "Office Phone",
      type: (stateRetriever) => "tel",
      required: true,
      placeholder: "xxx xxx-xxxx",
      onKeyUp: (event, helpers, stateConsumer) => {
        stateConsumer("other_phone", formatUSPhoneNumber(event.target.value), "client_details");
        event.target.value = formatUSPhoneNumberPretty(event.target.value);
      },
      valueFormatter: (value) => formatUSPhoneNumberPretty(value),
      validators: [
        (str) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(str)
      ]
    }
  ],
  cta: {
    actionLabel: () => "Next"
  },
  lifecycle: {
    onLoad: async (stateConsumer, helpers, stateRetriever, bulkComposeState) => {
      const mapped = stateRetriever("mapped") || [];
      const insurance_networks = stateRetriever("insurance_networks") || [];
      if (!mapped.length) {
        const referrals = await helpers.searchReferrals(false, false, stateRetriever("email"));
        const found_org = referrals.find((m) => m.domains.includes(stateRetriever("email").split("@")[1]));
        bulkComposeState("partner_details", {
          name: found_org ? found_org.value : (stateRetriever("name") || ""),
          partner_type: found_org ? found_org.type : (stateRetriever("partner_type") || ""),
          domain_approved: (!!found_org || (stateRetriever("domain_approved") || false)),
        });
        stateConsumer("hubspot_company_id", (found_org ? found_org.hubspot_company_id : ""), "registration_config");
        stateConsumer("is_confirmed_org", (!!found_org || false), "registration_config");
        stateConsumer("is_creating_new_org", (found_org ? false : stateRetriever("is_creating_new_org")), "registration_config");
      }
      if (!insurance_networks.length && (["ria"].includes(stateRetriever("partner_type")) && stateRetriever("is_life_insurance_affiliate"))) await helpers.getInsuranceNetworks("type", "insurance", false);
      window.history.pushState({}, document.title, window.location.pathname);
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => helpers.updateHubspotContact("In Progress"),
    shouldRender: (stateRetriever) => true
  }
};

export default config;