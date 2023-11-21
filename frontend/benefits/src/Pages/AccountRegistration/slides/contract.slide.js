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
import { capitalize } from "lodash";
import { sleep } from "../../../utilities";

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
    return (
      <ContractsLoader>
        {stateRetriever("finishing")
          ? <FontAwesomeIcon icon={["fad", "spinner"]} spin size="4x" />
          : (
            <ContractsLoaderMessage>
              <ContractsMessage>
                {(retrieveReduxState("hello_sign").request_id || user.benefits_data.signature_request_id)
                  ? "Please finish signing your contracts. Once your contracts are signed, your subscription will start and you will gain access to your Hope Trust Account."
                  : "Please sign your contracts. By clicking the Sign Contracts button below, you will be generating a unique set of contracts. Once your contracts are signed, you will gain access to your Hope Trust Account."
                }
                {(retrieveReduxState("hello_sign").request_id || user.benefits_data.signature_request_id)
                  ? <DownloadLink onClick={() => helpers.getHelloSignDownloadLink(retrieveReduxState("hello_sign").request_id || user.benefits_data.signature_request_id)}>{stateRetriever("is_downloading_agreement") ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : " Click here to download a copy of your contracts."}</DownloadLink>
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
    actionLabel: () => "Complete",
    haltNext: (stateRetriever) => stateRetriever("contract_signed") ? false : true,
    hideNext: (stateRetriever) => stateRetriever("contract_signed") ? false : true,
    additionalButton: {
      hide: (stateRetriever) => stateRetriever("contract_signed"),
      actionLabel: () => "Sign Contracts",
      action: (stateRetriever, stateConsumer, helpers) => {
        stateConsumer("loading_contracts", true, "registration_config");
        const user = retrieveReduxState("user");
        const organization = stateRetriever("name");
        if ((!retrieveReduxState("hello_sign").signature_request_id && !user.benefits_data.signature_id)) {
          const confirmOptions = {
            onOk: () => {
              const templates = ["808446b72d64242bd7a05ebde2c4c043a1394a61"];
              helpers.launchSignature(
                false,
                organization,
                `${capitalize(stateRetriever("user_type"))} Benefits Agreement`,
                "Before moving forward, please sign our benefits agreement.",
                [
                  {
                    email_address: user.email,
                    name: `${user.first_name} ${user.last_name}`,
                    role: "Benefits Partner"
                  }
                ],
                templates,
                async () => {
                  stateConsumer("is_approved_domain", true, "account_details");
                  await sleep(1000);
                  helpers.runRegisterAccount();
                }
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
          helpers.finishSignature(
            (retrieveReduxState("hello_sign").signature_request_id || user.benefits_data.signature_id),
            async () => {
              stateConsumer("is_approved_domain", true, "account_details");
              await sleep(1000);
              helpers.runRegisterAccount();
            }
          );
        }
      },
      disabled: (stateRetriever) => stateRetriever("loading_contracts") ? 1 : 0
    }
  },
  lifecycle: {
    onLoad: (stateConsumer, helpers, stateRetriever) => helpers.getAllOrgs(),
    onUnload: (stateConsumer, helpers, stateRetriever) => null,
    onSubmit: async (stateRetriever, stateConsumer, helpers) => null,
    shouldRender: (stateRetriever) => {
      const found = (stateRetriever("all_orgs") || []).find((org) => (org.type === stateRetriever("user_type") && org.name === stateRetriever("name")));
      if (stateRetriever("user_type") === "agent") return true;
      if (stateRetriever("authorized") && !found && (stateRetriever("account_type") === "new")) return true;
      if (retrieveReduxState("user").benefits_data && retrieveReduxState("user").benefits_data.status === "pending") return true;
    }
  }
};

export default config;