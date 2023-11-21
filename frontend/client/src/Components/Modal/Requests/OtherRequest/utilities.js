import React from "react";
import { ViewContainer, TextArea, InputWrapper, InputLabel, RequiredStar, FormError } from "../../../../global-components";
import CustomDateInput from "../../../../Components/CustomDateInput";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

const isFuture = (date) => {
  return date.isAfter(moment(), "minute");
};

export const buildRequestBody = (state, steps, handlers) => {
  switch(steps[state.currentStep].title) {
    case "Reason":
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Note ({255 - state.notes.length} characters remaining)</InputLabel>
            <TextArea maxLength={255} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} paddingtop={10} placeholder="ie: In a few words, describe what you are requesting" id="notes" onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)} defaultValue={state.notes}></TextArea>
          </InputWrapper>
        </ViewContainer>
      );
    case "Date":
      const updateDate = (date) => {
        handlers.updateRequestBody("date_error", false);
        handlers.updateRequestBody("date", date);
      };
      const throwError = () => {
        handlers.updateRequestBody("date_error", true);
        setTimeout(() => {
          handlers.updateRequestBody("date_error", false);
        }, 3500);
      };
      return (
        <InputWrapper>
          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Required Date & Time</InputLabel>
          <DatePicker
            selected={state.date}
            onChange={(date) => isFuture(moment(date)) ? updateDate(date) : throwError()}
            showTimeSelect
            timeFormat="hh:mm aa"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            customInput={<CustomDateInput />}
            minDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            withPortal
            placeholderText="Choose a date and time"
          />
          <FormError>{state.date_error ? "Date must be in the future." : ""}</FormError>
        </InputWrapper>
      );
    case "Priority":
      const request_priorities = [
        { value: "normal", label: "Normal" },
        { value: "low", label: "Low" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" }
      ];
      return (
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
      );
    default:
      return (
        <div>Default view</div>
      );
  }
};