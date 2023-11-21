import React from "react";
import { ImageUploader } from "../../../Components/ImageUploader";


const config = {
  id: "avatar_slide",
  title: (stateRetriever) => `Upload A Photo For ${stateRetriever("first_name")}`,
  collector: "account_details",
  Component: (stateRetriever, stateConsumer) => {
    return (
      <ImageUploader
        stateRetriever={stateRetriever}
        stateConsumer={stateConsumer}
        image={stateRetriever("avatar")}
        collection_key="avatar"
        controller="account_details"
      />
    );
  },
  component_validators: [],
  cta: {
    actionLabel: () => "Next"
  },
  lifecycle: {
    onLoad: () => null,
    onSubmit: async (stateRetriever, stateConsumer, helpers) => null,
    shouldRender: (stateRetriever) => true
  }
};

export default config;