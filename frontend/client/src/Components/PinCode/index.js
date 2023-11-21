import React, { useEffect, useRef } from "react";
import ReactPinCodeInput from "react-pin-field";
import { InputWrapper } from "../../global-components";
import {
  PinFieldMain,
  PinFieldMessage,
  PinFieldFormFields,
  PinFieldSecondaryMessage
} from "./style";

export const PinCode = ({ stateRetriever, stateConsumer }) => {
  const user = stateRetriever("login_user") || {};
  const number = user?.challengeParam?.CODE_DELIVERY_DESTINATION;
  const ref = useRef([]);
  useEffect(() => {
    ref.current.inputs[0].focus();
  }, []);
  return (
    <PinFieldMain style={{ width: "max-content", margin: "auto", textAlign: "center" }}>
      <PinFieldMessage>Enter the code that was sent to your phone.</PinFieldMessage>
      {user && user.challengeParam
        ? <PinFieldSecondaryMessage>Code was sent to number ending in {number.replace("+*******", "")}.</PinFieldSecondaryMessage>
        : <PinFieldSecondaryMessage>Code was sent to your mobile device.</PinFieldSecondaryMessage>
      }
      <PinFieldFormFields>
        <InputWrapper className="pin-field-container">
          <ReactPinCodeInput
            className="pin-field"
            onComplete={(complete) => {
              stateConsumer("mfa_code", complete, "mfa_details");
              stateConsumer("mfa_complete", true, "mfa_details");
            }}
            length={6}
            format={(key) => key}
            type="number"
            validate="0123456789"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="new-password"
            inputMode="number"
            ref={ref}
          />
        </InputWrapper>
      </PinFieldFormFields>
    </PinFieldMain>
  );
};