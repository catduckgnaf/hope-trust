import { differenceBy } from "lodash";
import React from "react";
import RelationshipPicker from "../../../Components/RelationshipPicker";
import authenticated from "../../../store/actions/authentication"; 
import { changeFormSlide } from "../../../store/actions/multipart-form";
import { retrieveReduxState } from "../../../store/actions/utilities";

const user_types = (stateRetriever) => {
  let types = [
    {
      name: "wholesale",
      alias: "Wholesale Agency",
      text: "this is some text for wholesalers",
      shouldRender: true
    },
    {
      name: "retail",
      alias: "Retail Agency",
      text: "this is some text for retailers",
      shouldRender: true
    },
    {
      name: "agent",
      text: "this is some text for agents",
      shouldRender: stateRetriever("account_type") !== "addition"
    },
    {
      name: "group",
      text: "this is some text for groups",
      shouldRender: true
    },
    {
      name: "team",
      alias: "Onboarding Team",
      text: "this is some text for teams",
      shouldRender: true
    }
  ];
  const valid = types.filter((type) => (stateRetriever("matched_orgs") || []).find((o) => o.type === type.name));
  const available = differenceBy(types, valid, "name");
  if (stateRetriever("create_override")) return available;
  if (!stateRetriever("create_override") && (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length)) return valid;
  return types;
};

const config = {
  id: "relationship_type",
  title: (stateRetriever) => `What Type Of Account Are You ${stateRetriever("account_type") !== "addition" ? "Creating" : "Joining"}?`,
  collector: "account_details",
  secondaryCta: {
    position: "right",
    label: "Sign Out",
    action: () => authenticated.logOut()
  },
  Component: (stateRetriever, stateConsumer) => <RelationshipPicker stateConsumer={stateConsumer} stateRetriever={stateRetriever} options={user_types} filter="user_type" />,
  component_validators: [
    (stateRetriever) => stateRetriever("user_type")
  ],
  previousAction: (stateRetriever) => changeFormSlide(0),
  cta: {
    actionLabel: () => "Next",
    additionalButton: {
      hide: (stateRetriever) => !stateRetriever("matched_orgs") || (stateRetriever("matched_orgs") && !stateRetriever("matched_orgs").length),
      actionLabel: () => "Create New",
      action: async (stateRetriever, stateConsumer, helpers) => {
        stateConsumer("user_type", "", "account_details");
        stateConsumer("create_override", true, "account_details");
        stateConsumer("account_type", "new", "account_details");
        stateConsumer("matched_orgs", [], "account_details");
        await helpers.setLoading();
        helpers.changeFormSlide(0);
      }
    }
  },
  lifecycle: {
    onUnload: (stateConsumer, helpers, stateRetriever) => stateConsumer("authorized", false, "registration_config"),
    onLoad: async (stateConsumer, helpers, stateRetriever) => {
      stateConsumer("is_joining_org", false, "account_details");
      if (stateRetriever("create_override") && stateRetriever("account_type") === "addition") helpers.getAllOrgs();
    },
    onSubmit: (stateRetriever, stateConsumer, helpers) => {
      if (stateRetriever("matched_orgs") && stateRetriever("matched_orgs").length && stateRetriever("user_type")) {
        const match = stateRetriever("matched_orgs").find((md) => md.type === stateRetriever("user_type"));
        if (match) {
          stateConsumer("parent_id", match.cognito_id, "account_details");
          stateConsumer("name", match.name, "account_details");
        }
      }
    },
    shouldRender: (stateRetriever) => {
      if (retrieveReduxState("user").benefits_data && retrieveReduxState("user").benefits_data.status === "pending") return false;
      if (stateRetriever("account_type")) return true;
      return false;
    }
  }
};

export default config;