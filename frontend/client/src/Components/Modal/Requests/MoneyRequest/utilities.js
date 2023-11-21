import React from "react";
import {
  ViewContainer,
  InputWrapper,
  InputLabel,
  Input,
  TextArea,
  RequiredStar
} from "../../../../global-components";
import { allowNumbersOnly, limitInput } from "../../../../utilities";
import Select from "react-select";

export const buildRequestBody = (state, steps, handlers) => {
  switch (steps[state.currentStep].title) {
    case "Reason":
      const request_types = [
        { value: "food", label: "Food" },
        { value: "transportation", label: "Transportation" },
        { value: "shopping", label: "Shopping" },
        { value: "entertainment", label: "Entertainment" },
        { value: "other", label: "Other" }
      ];
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Money Request Type</InputLabel>
            <Select
              styles={{
                container: (base, state) => ({
                  ...base,
                  opacity: state.isDisabled ? ".5" : "1",
                  backgroundColor: "transparent",
                  zIndex: "999"
                })
              }}
              isClearable
              isSearchable
              onChange={(event) => handlers.updateRequestBody("request_subcategory", event.value)}
              value={request_types.find((item) => item.value === state.request_subcategory)}
              options={request_types}
            />
          </InputWrapper>
        </ViewContainer>
      );
    case "Amount":
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Amount</InputLabel>
            <Input min={0} onKeyPress={allowNumbersOnly} onKeyDown={(event) => limitInput(event, 6)} id="request_amount" onFocus={(event) => handlers.updateRequestBody(event.target.id, "")} onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)} type="number" inputMode="numeric" pattern="[0-9]*" value={state.request_amount} />
          </InputWrapper>
        </ViewContainer>
      );
    case "Note":
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Note ({255 - state.notes.length} characters remaining)</InputLabel>
            <TextArea maxLength={255} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} paddingtop={10} placeholder="ie: I need to buy a new video game" id="notes" onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)} value={state.notes}></TextArea>
          </InputWrapper>
        </ViewContainer>
      );
    case "Priority":
      const request_priorities = [
        { value: "normal", label: "Normal" },
        { value: "low", label: "Low" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" }
      ];
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Priority</InputLabel>
            <Select
              styles={{
                container: (base, state) => ({
                  ...base,
                  opacity: state.isDisabled ? ".5" : "1",
                  backgroundColor: "transparent",
                  zIndex: "999"
                })
              }}
              onChange={(event) => handlers.updateRequestBody("priority", event.value)}
              value={request_priorities.find((item) => item.value === state.priority)}
              options={request_priorities}
            />
          </InputWrapper>
        </ViewContainer>
      );
    default:
      return (
        <div>Default view</div>
      );
  }
};