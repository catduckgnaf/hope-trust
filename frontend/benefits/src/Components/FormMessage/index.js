import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FormMessageMain,
  FormMessagePadding,
  FormMessageInner,
  FormMessageIcon,
  FormMessageText
} from "./style";

export const FormMessage = (props) => {
  let { id, component_key, message } = props;

  return (
    <FormMessageMain id={id} key={component_key}>
      <FormMessagePadding>
        <FormMessageInner>
          <FormMessageIcon>
            <FontAwesomeIcon icon={["fad", "exclamation-circle"]} />
          </FormMessageIcon>
          <FormMessageText>{message}</FormMessageText>
        </FormMessageInner>
      </FormMessagePadding>
    </FormMessageMain>
  );
};