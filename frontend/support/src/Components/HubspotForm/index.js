import React from "react";
import { useHubspotForm } from "@aaronhayes/react-use-hubspot-form";
import { Main, FormInner } from "./style";

const HubspotForm = (props) => {
  const { error } = useHubspotForm({
    portalId: "8356078",
    formId: props.formId,
    target: "#target_form"
  });

  return (
    <Main>
      <FormInner id="target_form"></FormInner>
      {error
        ? "Error: Could not load form"
        : null
      }
    </Main>
  );
};

export default HubspotForm;