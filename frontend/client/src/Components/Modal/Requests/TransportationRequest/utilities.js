import React from "react";
import { ViewContainer, Input, InputWrapper, InputLabel, RequiredStar, FormError } from "../../../../global-components";
import CustomDateInput from "../../../../Components/CustomDateInput";
import { US_STATES, limitInput } from "../../../../utilities";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const isFuture = (date) => {
  return date.isAfter(moment(), "minute");
};

export const buildRequestBody = (state, steps, handlers) => {
  switch(steps[state.currentStep].title) {
    case "Destination":
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Destination Name</InputLabel>
            <Input placeholder="Where are you going? Example: The Mall" id="destination" type="text" onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)} value={state.destination} />
          </InputWrapper>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Address</InputLabel>
            <Input
              placeholder="additional address"
              id="address"
              type="text"
              autoComplete="new-password"
              autoFill="off"
              name="address"
              onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)}
              value={state.address}
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel>Address 2</InputLabel>
            <Input
              placeholder="additional address"
              id="address2"
              type="text"
              autoComplete="new-password"
              autoFill="off"
              name="address2"
              onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)}
              value={state.address2}
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> City</InputLabel>
            <Input
              placeholder="Enter a city..."
              id="city"
              type="text"
              autoComplete="new-password"
              autoFill="off"
              name="city"
              onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)}
              value={state.city}
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> State</InputLabel>
            <Select
              styles={{
                container: (base, state) => ({
                  ...base,
                  opacity: state.isDisabled ? ".5" : "1",
                  backgroundColor: "transparent",
                  zIndex: "999"
                })
              }}
              menuPlacement="auto"
              maxMenuHeight={250}
              isClearable
              isSearchable
              onChange={(event) => handlers.updateRequestBody("state", event.value)}
              value={state.state ? { value: state.state, label: state.state } : null}
              options={US_STATES.map((formState) => {
                return {
                  value: formState.name,
                  label: formState.name
                };
              })}
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Zip Code</InputLabel>
            <Input
              onKeyPress={(event) => limitInput(event, 4)}
              inputMode="numeric"
              pattern="[0-9]*"
              id="zip"
              type="number"
              autoComplete="new-password"
              autoFill="off"
              name="zip"
              placeholder="Enter a zip code..."
              onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)}
              onFocus={(event) => handlers.updateRequestBody(event.target.id, "")}
              value={state.zip}
            />
          </InputWrapper>
        </ViewContainer>
      );
    case "Dropoff":
      const updateDropoffDate = (date) => {
        handlers.updateRequestBody("dropoff_date_error", false);
        handlers.updateRequestBody("dropoff_date", date);
      };
      const throwDropoffError = () => {
        handlers.updateRequestBody("dropoff_date_error", true);
        setTimeout(() => {
          handlers.updateRequestBody("dropoff_date_error", false);
        }, 3500);
      };
      return (
        <InputWrapper>
          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Dropoff</InputLabel>
          <DatePicker
            selected={state.dropoff_date}
            onChange={(date) => isFuture(moment(date)) ? updateDropoffDate(date) : throwDropoffError()}
            showTimeSelect
            timeFormat="h:mm"
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
          <FormError>{state.dropoff_date_error ? "Date must be in the future." : ""}</FormError>
        </InputWrapper>
      );
    case "Pickup":
      const updatePickupDate = (date) => {
        handlers.updateRequestBody("pickup_date_error", false);
        handlers.updateRequestBody("pickup_date", date);
      };
      const throwPickupError = () => {
        handlers.updateRequestBody("pickup_date_error", true);
        setTimeout(() => {
          handlers.updateRequestBody("pickup_date_error", false);
        }, 3500);
      };
      return (
        <InputWrapper>
          <InputLabel marginbottom={10}>Pickup (optional)</InputLabel>
          <DatePicker
            selected={state.pickup_date}
            onChange={(date) => isFuture(moment(date)) ? updatePickupDate(date) : throwPickupError()}
            showTimeSelect
            timeFormat="h:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            customInput={<CustomDateInput />}
            minDate={new Date(moment(state.dropoff_date))}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            withPortal
            placeholderText="Choose a date and time"
          />
          <FormError>{state.pickup_date_error ? "Date must be in the future." : ""}</FormError>
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