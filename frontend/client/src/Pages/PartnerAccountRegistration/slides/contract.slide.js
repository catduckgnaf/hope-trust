import React from "react";
import { retrieveReduxState } from "../../../store/actions/utilities";
import {
  ContractsLoader,
  ContractsLoaderMessage,
  DownloadLink,
  ContractsMessage
} from "../styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import authenticated from "../../../store/actions/authentication";
import { toastr } from "react-redux-toastr";

const config = {
  id: "contract_slide",
  title: (stateRetriever) => "Sign Your Contracts",
  collector: "registration_config",
  secondaryCta: {
    position: "right",
    label: "Log Out",
    action: () => authenticated.logOut()
  },
  Component: (stateRetriever, stateConsumer, helpers) => {
    const user = retrieveReduxState("user");
    const plan_choice = stateRetriever("plan_choice") || retrieveReduxState("plans").active_partner_plans.find((p) => p.name === user.partner_data.plan_type);
    return (
      <ContractsLoader>
        {stateRetriever("finishing") || (plan_choice && stateRetriever(`is_loading_${plan_choice.name}`))
          ? <FontAwesomeIcon icon={["fad", "spinner"]} spin size="4x" />
          : (
            <ContractsLoaderMessage>
              <ContractsMessage>
                {user.partner_data.signature_id && (plan_choice && (plan_choice.name === retrieveReduxState("user").partner_data.plan_type))
                  ? "Please finish signing your contracts. Once your contracts are signed, your subscription will start and you will gain access to your Hope Trust Account."
                  : "Please sign your contracts. By clicking the Sign Contracts button below, you will be generating a unique set of contracts. Once your contracts are signed, your subscription will start and you will gain access to your Hope Trust Account."
                }
                {(retrieveReduxState("hello_sign").request_id || retrieveReduxState("user").partner_data.signature_request_id) && (plan_choice && (plan_choice.name === retrieveReduxState("user").partner_data.plan_type))
                  ? <DownloadLink onClick={() => helpers.getHelloSignDownloadLink(retrieveReduxState("hello_sign").request_id || retrieveReduxState("user").partner_data.signature_request_id)}>{stateRetriever("is_downloading_agreement") ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : " Click here to download a copy of your contracts."}</DownloadLink>
                  : null
                }
              </ContractsMessage>
            </ContractsLoaderMessage>
          )
        }
      </ContractsLoader>
    );
  },
  component_validators: [
    (stateRetriever) => stateRetriever("contract_signed")
  ],
  cta: {
    haltNext: (stateRetriever) => true,
    hideNext: (stateRetriever) => true,
    additionalButton: {
      actionLabel: () => "Sign Contracts",
      action: (stateRetriever, stateConsumer, helpers) => {
        stateConsumer("loading_contracts", true, "registration_config");
        const user = retrieveReduxState("user");
        const organization = user.partner_data.name;
        const primary_network = user.partner_data.primary_network;
        const plan_choice = stateRetriever("plan_choice") || retrieveReduxState("plans").active_partner_plans.find((p) => p.name === user.partner_data.plan_type);
        if (!retrieveReduxState("user").partner_data.contract_signed) {
          let monthly_cost = (plan_choice.monthly / 100);
          let additional_plan_cost = plan_choice.additional_plan_credits;
          if (plan_choice && plan_choice.coupon) {
            monthly_cost = (monthly_cost - (plan_choice.coupon.percent_off ? (monthly_cost * plan_choice.coupon.percent_off) : plan_choice.coupon.amount_off) / 100);
            additional_plan_cost = (additional_plan_cost - (plan_choice.coupon.percent_off ? (additional_plan_cost * plan_choice.coupon.percent_off) : plan_choice.coupon.amount_off) / 100);
          }
          if (!user.partner_data.signature_id || (stateRetriever("plan_choice") && (stateRetriever("plan_choice").name !== retrieveReduxState("user").partner_data.plan_type))) {
            const confirmOptions = {
              onOk: () => {
                let templates = [];
                const additional_contracts = JSON.parse(plan_choice.additional_contracts || "{}");
                if (user.partner_data.is_entity || stateRetriever("is_entity")) templates.push("1aa1989b83d91e5af9baf5826ce51d3086be6bef");
                if (additional_contracts[organization] || additional_contracts[primary_network]) {
                  templates.push(additional_contracts[organization] ? additional_contracts[organization] : additional_contracts[primary_network]);
                } else {
                  templates.push(plan_choice.default_template);
                }
                if (monthly_cost) templates.push(plan_choice.plan_cost_agreement);
                helpers.launchSignature(
                  plan_choice.name,
                  false,
                  "Partner Agreement",
                  "Before moving forward, please sign our partner agreement.",
                  [
                    {
                      email_address: user.email,
                      name: `${user.first_name} ${user.last_name}`,
                      role: "Referral Partner"
                    }
                  ],
                  templates,
                  monthly_cost,
                  plan_choice.seats_included,
                  additional_plan_cost
                );
              },
              onCancel: () => {
                toastr.removeByType("confirms");
                stateConsumer("loading_contracts", false, "registration_config");
              },
              okText: "Yes",
              cancelText: "No"
            };
            toastr.confirm("You are about to generate binding contracts. Are you sure you want to do this?\n\nA copy of your contracts will be available for download once they are generated.", confirmOptions);
          } else {
            stateConsumer("loading_contracts", true, "registration_config");
            helpers.finishSignature(plan_choice, user.partner_data.signature_id, monthly_cost, plan_choice.seats_included, additional_plan_cost);
          }
        }
      },
      disabled: (stateRetriever) => stateRetriever("loading_contracts") ? 1 : 0
    }
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => helpers.getOrganizationPartners({ name: retrieveReduxState("user").partner_data.name, contract_sign: true }, false),
    onUnload: (stateConsumer, helpers, stateRetriever) => null,
    onSubmit: async (stateRetriever, stateConsumer, helpers) => null,
    shouldRender: (stateRetriever) => (!!stateRetriever("plan_choice") || retrieveReduxState("user").partner_data.plan_type) && stateRetriever("authorized")
  }
};

export default config;