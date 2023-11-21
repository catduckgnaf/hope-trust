
import React from "react";
import { FormMessage } from "../../../Components/FormMessage/index";
import { MultipleSelect } from "../../../Components/MultipleSelect/index";
import { Hint, Button } from "../../../global-components";
import {
  FormInputGroup,
  FormCheckboxLabel,
  FormCheckboxLabelText,
  LabelHint
} from "../../../Components/multipart-form/elements.styles";
import { retrieveReduxState } from "../../../store/actions/utilities";
import { StyledFormCheckbox } from "../../../Components/multipart-form/form/inputs/styles";
import { WEBMAIL_PROVIDER_DOMAINS, isValidDomain, sleep } from "../../../utilities";

const config = {
  id: "account_info",
  title: (stateRetriever) => {
    if (stateRetriever("user_type") !== "agent") return `What Organization Are You ${stateRetriever("account_type") !== "addition" ? "Creating" : "Joining"}?`
    else return `Choose A Retailer`
  },
  subtitle: (stateRetriever) => {
    if (stateRetriever("user_type") === "agent") return <Hint style={{ margin: "auto", maxWidth: "40%", lineHeight: "18px" }} textalign="center" paddingtop={20}>As an Agent, you will be connected to this organization to onboard Hope Trust clients</Hint>
  },
  collector: "account_details",
  form: [
    {
      input_key: "name_field",
      id: "name",
      label: "Company/Organization",
      type: (stateRetriever) => "text",
      required: true,
      hint: "Organization name must be unique.",
      onKeyUp: (event, helpers, stateConsumer, stateRetriever) => {
        const orgs = stateRetriever("all_orgs");
        const exists = orgs.find((o) => (o.name === event.target.value) && (o.type === stateRetriever("user_type")));
        if (exists || !event.target.value) {
          stateConsumer("name_valid", false, "account_details");
          if (exists) {
            stateConsumer("name_error", `This ${exists.type} organization already exists.`, "account_details");
            stateConsumer("parent_id", exists.cognito_id, "account_details");
          }
        } else {
          stateConsumer("name_valid", true, "account_details");
          stateConsumer("name_error", "", "account_details");
          stateConsumer("parent_id", "", "account_details");
        }
      },
      validators: [
        (str, stateRetreiver) => stateRetreiver("name_valid")
      ],
      validation_error: (stateRetreiver) => stateRetreiver("name_error") ? <LabelHint error={!stateRetreiver("name_valid") ? 1 : 0} success={stateRetreiver("name_valid") ? 1 : 0}>{stateRetreiver("name_error")}</LabelHint> : null,
      renderInput: (stateRetriever) => stateRetriever("user_type") !== "agent" && stateRetriever("account_type") !== "addition",
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return (
          <>
            {["group", "team"].includes(stateRetriever("user_type"))
              ? (
                <FormInputGroup top={10}>
                  <FormCheckboxLabel htmlFor="has_broker_checkbox">
                    <StyledFormCheckbox name="has_broker_checkbox" type="checkbox" defaultChecked={stateRetriever("has_broker")} onChange={(event) => {
                      stateConsumer("has_broker", event.target.checked, "account_details");
                      stateConsumer("agent_id", "", "account_details");
                      stateConsumer("parent_id", "", "account_details");
                      stateConsumer("wholesale_id", "", "account_details");
                    }} />
                    <FormCheckboxLabelText>I want to add my Employee Benefits Broker</FormCheckboxLabelText>
                  </FormCheckboxLabel>
                </FormInputGroup>
              )
              : null
            }
            {(stateRetriever("name") && !stateRetriever("name_valid"))
              ? <Button style={{ position: "absolute", top: "29px", right: "10px" }} type="button" small rounded nomargin margintop={10} outline danger onClick={() => helpers.joinOrg(stateRetriever("name"))}>Join Organization</Button>
              : null
            }
          </>
        );
      }
    },
    {
      input_key: "wholesale_parent_id",
      id: "parent_id",
      label: "Wholesale Agency",
      type: (stateRetriever) => "selection",
      hint: "What Wholesaler are you affiliated with?",
      required: true,
      disableIf: (stateRetriever) => ((stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length) && stateRetriever("parent_id") && !stateRetriever("create_override")) || stateRetriever("is_joining_org"),
      options: (stateRetriever, helpers) => {
        let opts = helpers.wholesalers;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "wholesale");
        return opts.map((l) => {
          return { value: l.cognito_id, label: l.name };
        });
      },
      renderInput: (stateRetriever) => {
        const is_wholesale = stateRetriever("user_type") === "wholesale";
        const is_addition = stateRetriever("account_type") === "addition";
        if (is_wholesale && is_addition) return true;
        return false;
      },
      onChange: async (newValue, helpers, stateConsumer, stateRetriever) => {
        if (stateRetriever("account_type") === "addition") {
          const entity = helpers.wholesalers.find((e) => e.cognito_id === newValue);
          const domain = retrieveReduxState("user").email.split("@")[1];
          stateConsumer("name", entity.name, "account_details");
          stateConsumer("parent_id", entity.parent_id, "account_details");
          stateConsumer("is_approved_domain", entity.domains.includes(domain), "account_details");
        }
      }
    },
    {
      input_key: "agent_id_parent_id",
      id: "agent_id",
      label: "Agent",
      type: (stateRetriever) => "selection",
      required: false,
      placeholder: "Choose an Agent",
      disableIf: (stateRetriever) => ((stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length) && stateRetriever("parent_id") && !stateRetriever("create_override")) || stateRetriever("is_joining_org"),
      options: (stateRetriever, helpers) => {
        let opts = helpers.agents;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "agent");
        return opts.map((l) => {
          return { value: l.cognito_id, label: `${l.first_name} ${l.last_name} - ${l.retailer_name}` };
        });
      },
      renderInput: (stateRetriever) => {
        const has_broker = stateRetriever("has_broker");
        const is_group = stateRetriever("user_type") === "group";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (!is_addition && is_group && name_valid && has_broker) return true;
        return false;
      },
      onChange: async (newValue, helpers, stateConsumer, stateRetriever) => {
        const is_group = stateRetriever("user_type") === "group";
        const found_agent = newValue ? helpers.agents.find((a) => a.cognito_id === newValue) : false;
        const found_retail_account = found_agent ? helpers.retailers.find((r) => r.cognito_id === found_agent.parent_id) : false;
        if (found_retail_account) {
          stateConsumer("parent_id", found_retail_account.cognito_id, "account_details");
          stateConsumer("retail_id", found_retail_account.cognito_id, "account_details");
          const matched_wholesalers = retrieveReduxState("wholesale").list.filter((w) => found_retail_account.approved_wholesalers && found_retail_account.approved_wholesalers.length && found_retail_account.approved_wholesalers.includes(w.config_id));
          if (matched_wholesalers.length === 1 && is_group) stateConsumer("wholesale_id", matched_wholesalers[0].id, "account_details");
          else if (matched_wholesalers.length > 1) stateConsumer("wholesale_id", "", "account_details");
        }
        if (is_group) stateConsumer("agent_id", newValue, "account_details");
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        if (["group", "team"].includes(stateRetriever("user_type"))) return <Hint style={{ maxWidth: "500px", lineHeight: "18px" }} paddingtop={5} paddingleft={1}>If you were referred by an Agent/Broker, you may choose them from this list. If you do not see your broker, please contact Hope Trust Support at <a href="tel:18334673878">(833) 467-3878</a>. This field is optional.</Hint>;
      }
    },
    {
      input_key: "retail_parent_id",
      id: "parent_id",
      label: "Retail Agency",
      type: (stateRetriever) => "selection",
      hint: "What Retailer are you affiliated with?",
      required: true,
      disableIf: (stateRetriever) => (stateRetriever("user_type") === "group" && stateRetriever("agent_id")) || ((stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length) && stateRetriever("parent_id") && !stateRetriever("create_override")) || stateRetriever("is_joining_org"),
      options: (stateRetriever, helpers) => {
        let opts = helpers.retailers;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "retail");
        return opts.map((l) => {
          return { value: l.cognito_id, label: l.name };
        });
      },
      renderInput: (stateRetriever) => {
        const is_agent = stateRetriever("user_type") === "agent";
        const agent_id = stateRetriever("agent_id");
        const is_group = stateRetriever("user_type") === "group";
        const is_retail = stateRetriever("user_type") === "retail";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (is_agent) return true;
        if (is_retail && is_addition) return true;
        if (is_group && !is_addition && name_valid && agent_id) return true;
        return false;
      },
      onChange: async (newValue, helpers, stateConsumer, stateRetriever) => {
        const is_group = stateRetriever("user_type") === "group";
        if (is_group) stateConsumer("retail_id", newValue, "account_details");
        if (stateRetriever("account_type") === "addition") {
          const entity = helpers.retailers.find((e) => e.cognito_id === newValue);
          const domain = retrieveReduxState("user").email.split("@")[1];
          stateConsumer("name", entity.name, "account_details");
          stateConsumer("parent_id", entity.parent_id, "account_details");
          stateConsumer("is_approved_domain", entity.domains.includes(domain), "account_details");
        }
      }
    },
    {
      input_key: "wholesale_id",
      id: "wholesale_id",
      label: "Wholesale Agency",
      type: (stateRetriever) => "selection",
      hint: "What Wholesaler are you affiliated with?",
      required: true,
      disableIf: (stateRetriever) => {
        const retail_chosen = stateRetriever("retail_id");
        const is_joining = stateRetriever("is_joining_org");
        const is_match = ((stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length) && stateRetriever("parent_id") && !stateRetriever("create_override"))
        let single_wholesaler = false;
        let matched_wholesalers = [];
        if (retail_chosen) {
          const retailer = retrieveReduxState("retail").list.find((r) => r.cognito_id === retail_chosen);
          if (retailer) matched_wholesalers = retrieveReduxState("wholesale").list.filter((w) => retailer.approved_wholesalers && retailer.approved_wholesalers.length && retailer.approved_wholesalers.includes(w.config_id))
          if (matched_wholesalers.length === 1) single_wholesaler = true;
        }
        return (is_joining || is_match || single_wholesaler);
      },
      options: (stateRetriever, helpers) => {
        let opts = helpers.wholesalers;
        const retail_chosen = stateRetriever("retail_id");
        let matched_wholesalers = []
        if (retail_chosen) {
          const retailer = retrieveReduxState("retail").list.find((r) => r.cognito_id === retail_chosen);
          if (retailer) matched_wholesalers = opts.filter((w) => retailer.approved_wholesalers && retailer.approved_wholesalers.length && retailer.approved_wholesalers.includes(w.config_id))
        }
        return matched_wholesalers.map((l) => {
          return { value: l.id, label: l.name };
        });
      },
      renderInput: (stateRetriever) => {
        const retail_chosen = stateRetriever("retail_id");
        let matched_wholesalers = []
        if (retail_chosen) {
          const retailer = retrieveReduxState("retail").list.find((r) => r.cognito_id === retail_chosen);
          if (retailer) matched_wholesalers = retrieveReduxState("wholesale").list.filter((w) => retailer.approved_wholesalers && retailer.approved_wholesalers.length && retailer.approved_wholesalers.includes(w.config_id))
        }
        const is_group = stateRetriever("user_type") === "group";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (is_group && !is_addition && name_valid && matched_wholesalers.length) return true;
        return false;
      },
      onChange: async (newValue, helpers, stateConsumer, stateRetriever) => null
    },
    {
      input_key: "group_multi_wholesale_message",
      id: "group_multi_wholesale_message",
      type: (stateRetriever) => "component",
      message: <div>If you are not sure which Wholesaler you are working with, please contact your Employee Benefits Broker or Hope Trust Support at <a href="tel:18334673878">(833) 467-3878</a></div>,
      Component: FormMessage,
      component_key: "group_multi_wholesale_message_key",
      validators: [],
      renderInput: (stateRetriever, helpers) => {
        let opts = helpers.wholesalers;
        const is_group = stateRetriever("user_type") === "group";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        const retail_chosen = stateRetriever("retail_id");
        let matched_wholesalers = []
        if (retail_chosen) {
          const retailer = retrieveReduxState("retail").list.find((r) => r.cognito_id === retail_chosen);
          if (retailer) matched_wholesalers = opts.filter((w) => retailer.approved_wholesalers && retailer.approved_wholesalers.length && retailer.approved_wholesalers.includes(w.config_id))
        }
        if (is_group && !is_addition && name_valid && matched_wholesalers.length > 1) return true;
        return false;
      },
      required: false
    },
    {
      input_key: "agent_parent_id",
      id: "parent_id",
      label: "Agent",
      type: (stateRetriever) => "selection",
      required: false,
      disableIf: (stateRetriever) => ((stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length) && stateRetriever("parent_id") && !stateRetriever("create_override")) || stateRetriever("is_joining_org"),
      options: (stateRetriever, helpers) => {
        let opts = helpers.agents;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "agent");
        return opts.map((l) => {
          return { value: l.cognito_id, label: `${l.first_name} ${l.last_name} - ${l.retailer_name}` };
        });
      },
      renderInput: (stateRetriever) => {
        const has_broker = stateRetriever("has_broker");
        const is_agent = stateRetriever("user_type") === "agent";
        const is_team = stateRetriever("user_type") === "team";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (is_agent && is_addition) return true;
        if (!is_addition && is_team && name_valid && has_broker) return true;
        return false;
      },
      onChange: async (newValue, helpers, stateConsumer, stateRetriever) => {
        if (stateRetriever("account_type") === "addition") {
          const entity = helpers.agents.find((e) => e.cognito_id === newValue);
          const domain = retrieveReduxState("user").email.split("@")[1];
          stateConsumer("name", entity.name, "account_details");
          stateConsumer("parent_id", entity.parent_id, "account_details");
          stateConsumer("is_approved_domain", entity.domains.includes(domain), "account_details");
        }
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        if (["group", "team"].includes(stateRetriever("user_type"))) return <Hint style={{ maxWidth: "500px", lineHeight: "18px" }} paddingtop={5} paddingleft={1}>If you were referred by an Agent, you may choose them from this list. This field is optional.</Hint>;
      }
    },
    {
      input_key: "group_parent_id",
      id: "parent_id",
      label: "Group",
      type: (stateRetriever) => "selection",
      hint: "What Group are you affiliated with?",
      required: true,
      disableIf: (stateRetriever) => (((stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length) && stateRetriever("parent_id") && !stateRetriever("create_override"))) || stateRetriever("is_joining_org"),
      options: (stateRetriever, helpers) => {
        let opts = helpers.groups;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "group");
        return opts.map((l) => {
          return { value: l.cognito_id, label: l.name };
        });
      },
      renderInput: (stateRetriever) => {
        const is_group = stateRetriever("user_type") === "group";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (is_group && is_addition) return true;
        if (is_group && !is_addition) return false;
        if (!is_addition && is_group && name_valid) return true;
        return false;
      },
      onChange: async (newValue, helpers, stateConsumer, stateRetriever) => {
        const entity = helpers.groups.find((e) => e.cognito_id === newValue);
        if (stateRetriever("account_type") === "addition" && stateRetriever("user_type") === "group") {
          const domain = retrieveReduxState("user").email.split("@")[1];
          stateConsumer("name", entity.name, "account_details");
          stateConsumer("parent_id", entity.parent_id, "account_details");
          stateConsumer("is_approved_domain", entity.domains.includes(domain), "account_details");
        }
      }
    },
    {
      input_key: "team_parent_id",
      id: "parent_id",
      label: "Team",
      type: (stateRetriever) => "selection",
      hint: "What Onboarding Team are you affiliated with?",
      required: true,
      disableIf: (stateRetriever) => ((stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length) && stateRetriever("parent_id") && !stateRetriever("create_override")) || stateRetriever("is_joining_org"),
      options: (stateRetriever, helpers) => {
        let opts = helpers.teams;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "team");
        return opts.map((l) => {
          return { value: l.cognito_id, label: l.name };
        });
      },
      renderInput: (stateRetriever) => {
        const is_team = stateRetriever("user_type") === "team";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (is_team && is_addition) return true;
        if (is_team && !is_addition) return false;
        if (!is_addition && is_team && name_valid) return true;
        return false;
      },
      onChange: async (newValue, helpers, stateConsumer, stateRetriever) => {
        if (stateRetriever("account_type") === "addition") {
          const entity = helpers.teams.find((e) => e.cognito_id === newValue);
          const domain = retrieveReduxState("user").email.split("@")[1];
          stateConsumer("name", entity.name, "account_details");
          stateConsumer("parent_id", entity.parent_id, "account_details");
          stateConsumer("is_approved_domain", entity.domains.includes(domain), "account_details");
        }
      }
    },
    {
      hide_dropdown: false,
      clearable: true,
      input_key: "valid_groups",
      id: "valid_groups",
      label: "Groups",
      type: (stateRetriever) => "component",
      Component: MultipleSelect,
      component_key: "valid_groups_key",
      validators: [],
      placeholder: "Start typing a group...",
      valueFormatter: (value = []) => {
        return value.map((v) => {
          const entity = retrieveReduxState("groups").list.find((e) => e.config_id === v);
          if (entity) return { value: entity.config_id, label: entity.name, data: entity };
          return false;
        });
      },
      onChange: (value, stateRetriever, stateConsumer) => null,
      required: false,
      options: (stateRetriever, helpers) => {
        const parent_groups = helpers.groups.filter((org) => org.type === "group" && org.parent_id === stateRetriever("parent_id"));
        let opts = stateRetriever("parent_id") && parent_groups.length ? parent_groups : helpers.groups;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "group");
        if (stateRetriever("user_type") === "agent") opts = opts.filter((g) => g.approved_types && !g.approved_types.includes("agent"));
        if (stateRetriever("user_type") === "team") opts = opts.filter((g) => g.approved_types && !g.approved_types.includes("team"));
        return opts.map((l) => {
          return { value: l.config_id, label: l.name, data: l };
        });
      },
      default_values: (stateRetriever, helpers) => [],
      renderInput: (stateRetriever) => false,
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        if (["team", "agent"].includes(stateRetriever("user_type"))) return <Hint style={{ maxWidth: "500px", lineHeight: "18px" }} paddingtop={5} paddingleft={1}>If you wish to be affiliated with one or more Groups, you may choose them from this list. Approval requests will be sent to the chosen groups. This field is optional.</Hint>;
      }
    },
    {
      input_key: "group_connection_message",
      id: "group_connection_message",
      type: (stateRetriever) => "component",
      message: <div>If you are registering to work with a specific Group, please contact Hope Trust Support at <a href="tel:18334673878">(833) 467-3878</a></div>,
      Component: FormMessage,
      component_key: "group_connection_message_key",
      validators: [],
      renderInput: (stateRetriever) => {
        const is_team = stateRetriever("user_type") === "team";
        const is_agent = stateRetriever("user_type") === "agent";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (is_team && !is_addition && name_valid) return true;
        if (is_agent && !is_addition) return true;
        return false;
      },
      required: false
    },
    {
      hide_dropdown: false,
      clearable: true,
      input_key: "valid_wholesalers",
      id: "valid_wholesalers",
      label: "Wholesale Accounts",
      type: (stateRetriever) => "component",
      Component: MultipleSelect,
      component_key: "valid_wholesalers_key",
      validators: [],
      placeholder: "Start typing a wholesaler...",
      valueFormatter: (value = []) => {
        return value.map((v) => {
          const entity = retrieveReduxState("wholesale").list.find((e) => e.config_id === v);
          if (entity) return { value: entity.config_id, label: entity.name, data: entity };
          return false;
        });
      },
      onChange: (value, stateRetriever, stateConsumer) => null,
      required: false,
      options: (stateRetriever, helpers) => {
        const parent_wholesalers = helpers.wholesalers.filter((org) => org.type === "wholesale" && org.parent_id === stateRetriever("parent_id"));
        let opts = stateRetriever("parent_id") && parent_wholesalers.length ? parent_wholesalers : helpers.wholesalers;
        if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && !stateRetriever("create_override")) opts = stateRetriever("matched_orgs").filter((org) => org.type === "wholesale");
        return opts.map((l) => {
          return { value: l.config_id, label: l.name, data: l };
        });
      },
      default_values: (stateRetriever, helpers) => [],
      renderInput: (stateRetriever) => {
        const is_retail = stateRetriever("user_type") === "retail";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (is_retail && !is_addition && name_valid) return true;
        return false;
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        if (["retail"].includes(stateRetriever("user_type"))) return <Hint style={{ maxWidth: "500px", lineHeight: "18px" }} paddingtop={5} paddingleft={1}>If you wish to be affiliated with one or more Wholesale accounts, you may choose them from this list. Approval requests will be sent to the chosen account holders. This field is optional.</Hint>;
      }
    },
    {
      hide_dropdown: true,
      clearable: false,
      input_key: "entity_valid_domains",
      id: "valid_domains",
      label: "Valid Domains",
      type: (stateRetriever) => "component",
      Component: MultipleSelect,
      component_key: "valid_domains_key",
      validators: [
        (str, stateRetriever) => stateRetriever("valid_domains") && stateRetriever("valid_domains").length
      ],
      placeholder: "Start typing a domain and hit the Enter key...",
      valueFormatter: (value = []) => {
        const domain = retrieveReduxState("user").email.split("@")[1];
        return value.map((v) => {
          return { value: v, label: v, isFixed: (v === domain && !WEBMAIL_PROVIDER_DOMAINS.includes(domain)) };
        });
      },
      onChange: (value, stateRetriever) => {
        if (!WEBMAIL_PROVIDER_DOMAINS.includes(value) && isValidDomain(value) && !(stateRetriever("valid_domains") || []).includes(value)) return true;
        return false;
      },
      required: true,
      options: [],
      default_values: (stateRetriever) => {
        const domain = retrieveReduxState("user").email.split("@")[1];
        if (domain && !WEBMAIL_PROVIDER_DOMAINS.includes(domain)) return [domain];
        return [];
      },
      renderInput: (stateRetriever) => {
        const is_agent = stateRetriever("user_type") === "agent";
        const is_addition = stateRetriever("account_type") === "addition";
        const name_valid = stateRetriever("name") && stateRetriever("name_valid");
        if (!is_agent && !is_addition && name_valid) return true;
      },
      input_appendage: (stateRetriever, helpers, stateConsumer) => {
        return <Hint style={{ maxWidth: "500px", lineHeight: "18px" }} paddingtop={5} paddingleft={1}>Additional users will be approved to join your account if they register with any of these domains. You will be able to manually approve domains outside your organization.</Hint>;
      }
    }
  ],
  cta: {
    actionLabel: (stateRetriever) => (stateRetriever("account_type") === "new") ? "Next" : "Complete",
    props: (stateRetriever) => {
      return {
        pulse: stateRetriever("is_joining_org") ? 1 : 0
      }
    }
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => {
      const domain = retrieveReduxState("user").email.split("@")[1];
      const current_domains = stateRetriever("valid_domains") || [];
      if (!WEBMAIL_PROVIDER_DOMAINS.includes(domain) && !current_domains.includes(domain)) {
        stateConsumer("valid_domains", [domain, ...current_domains], "account_details");
      }
      switch(stateRetriever("user_type")) {
        case "wholesale":
          helpers.getPublicWholesalers();
          break;
        case "retail":
          helpers.getPublicRetailers();
          helpers.getPublicWholesalers();
          break;
        case "agent":
          helpers.getPublicRetailers();
          break;
        case "group":
          helpers.getPublicGroups();
          helpers.getPublicAgents();
          break;
        case "team":
          helpers.getPublicTeams();
          helpers.getPublicAgents();
          helpers.getPublicGroups();
          break;
        default:
          break;
      }
    },
    onSubmit: async (stateRetriever, stateConsumer, helpers) => {
      if (stateRetriever("account_type") === "addition") {
        const domain = retrieveReduxState("user").email.split("@")[1];
        const org = stateRetriever("all_orgs").find((o) => (o.name === stateRetriever("name")) && (o.type === stateRetriever("user_type")))
        if (org && stateRetriever("account_type") === "addition") stateConsumer("is_approved_domain", org.domains.includes(domain), "account_details");
        await sleep(1000);
        helpers.runRegisterAccount();
      }
    },
    shouldRender: (stateRetriever) => {
      if (retrieveReduxState("user").benefits_data && retrieveReduxState("user").benefits_data.status === "pending") return false;
      if (stateRetriever("user_type")) return true;
      return false;
    }
  }
};

export default config;