import React from "react";
import {
  Bold,
  SidebarHeading,
  SidebarDivider,
  SidebarParagraph
} from "../../../Components/multipart-form/elements.styles";
import { ImageUploader } from "../../../Components/ImageUploader";


const config = {
  id: "avatar_slide",
  title: (stateRetriever) => "Upload A Profile Photo",
  collector: "registration_config",
  Component: (stateRetriever, stateConsumer) => {
    return (
      <ImageUploader
        stateRetriever={stateRetriever}
        stateConsumer={stateConsumer}
        image={stateRetriever("avatar")}
        collection_key="avatar"
        controller="client_details"
      />
    );
  },
  component_validators: [],
  sidebar: (stateRetriever) => (
    <>
      <SidebarHeading>
        Hope Trust is the <Bold>first and only</Bold> comprehensive, holistic solution that addresses the unique and ever-evolving needs of <Bold>loved ones with special needs.</Bold>
      </SidebarHeading>
      <SidebarDivider />
      <SidebarParagraph>We created Hope Trust because our families and the family members with special needs we love, deserve more.</SidebarParagraph>
    </>
  ),
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