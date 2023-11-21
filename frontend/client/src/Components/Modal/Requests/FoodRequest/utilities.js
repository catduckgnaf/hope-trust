import React from "react";
import {
  ViewContainer,
  InputWrapper,
  InputLabel,
  Input,
  RequiredStar,
  FormError
} from "../../../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { US_STATES, limitInput } from "../../../../utilities";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  OrderItemInputMain,
  OrderItemInputPadding,
  OrderItemInputInner,
  OrderItemInput,
  OrderItemRemove
} from "./style";
import Select from "react-select";
import CustomDateInput from "../../../../Components/CustomDateInput";

const isFuture = (date) => {
  return date.isAfter(moment(), "minute");
};

export const buildRequestBody = (state, steps, handlers) => {
  switch(steps[state.currentStep].title) {
    case "Type":
      const request_subcategory_options = [
        { value: "restaurant", label: "Restaurant Delivery" },
        { value: "grocery", label: "Grocery Delivery" }
      ];
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Food Request Type</InputLabel>
            <Select
              styles={{container: (base, state) => ({
                ...base,
                opacity: state.isDisabled ? ".5" : "1",
                backgroundColor: "transparent",
                zIndex: "999"
              })}}
              isClearable
              isSearchable
              onChange={(event) => handlers.updateRequest("request_subcategory", event.value)}
              value={request_subcategory_options.find((item) => item.value === state.request_subcategory)}
              options={request_subcategory_options}
            />
          </InputWrapper>
        </ViewContainer>
      );
    case "Location":
      return (
        <ViewContainer>
          <InputWrapper>
            {state.request_subcategory === "grocery"
              ? <InputLabel><RequiredStar>*</RequiredStar> Store Name</InputLabel>
              : <InputLabel><RequiredStar>*</RequiredStar> Restaurant Name</InputLabel>
            }
            <Input placeholder={`Enter a ${state.request_subcategory === "grocery" ? "store" : "restaurant"} name...`} id="store" type="text" onChange={(event) => handlers.updateRequest(event.target.id, event.target.value)} value={state.store}/>
          </InputWrapper>
        </ViewContainer>
      );
    case "Order":
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Items (add an item and press enter)</InputLabel>
            <Input value={state.new_item} placeholder="Add a new item..." type="text" id="addNewItemInput" onChange={(event) => handlers.updateRequest("new_item", event.target.value)} onBlur={(event) => !state.items.includes(event.target.value) ? handlers.addNewRequestItem(event, true) : null} onKeyPress={(event) => handlers.addNewRequestItem(event)} />
            {state.items
              ? state.items.map((item, index) => {
                  return (
                    <OrderItemInputMain key={index}>
                      <OrderItemInputPadding>
                        <OrderItemInputInner gutter={20}>
                          <OrderItemInput span={11}>
                            <Input key={index} type="text" onChange={(event) => handlers.updateRequestItems(event.target.value, index)} value={item} />
                          </OrderItemInput>
                          <OrderItemRemove span={1} onClick={() => handlers.removeItem(item)}>
                            <FontAwesomeIcon icon={["fal", "times"]} />
                          </OrderItemRemove>
                        </OrderItemInputInner>  
                      </OrderItemInputPadding>
                    </OrderItemInputMain>
                  );
                })
              : null
            }
          </InputWrapper>
        </ViewContainer>
      );
    case "Delivery":
      const updateDate = (date) => {
        handlers.updateRequest("date_error", false);
        handlers.updateRequest("date", date);
      };
      const throwError = () => {
        handlers.updateRequest("date_error", true);
        setTimeout(() => {
          handlers.updateRequest("date_error", false);
        }, 3500);
      };
      return (
        <ViewContainer>
          <InputWrapper marginbottom={5}>
            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Delivery Date & Time</InputLabel>
            <DatePicker
              selected={state.date}
              onChange={(date) => isFuture(moment(date)) ? updateDate(date) : throwError()}
              showTimeSelect
              timeFormat="h:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              customInput={<CustomDateInput />}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              withPortal
              placeholderText="Choose a date and time"
              minDate={new Date()}
            />
            <FormError>{state.date_error ? "Date must be in the future." : ""}</FormError>
          </InputWrapper>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Address</InputLabel>
            <Input
              id="address"
              type="text"
              autoComplete="new-password"
              autofill="off"
              name="address1"
              onChange={(event) => handlers.updateRequest(event.target.id, event.target.value)}
              value={state.address}
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel>Address 2</InputLabel>
            <Input
              id="address2"
              type="text"
              autoComplete="new-password"
              autofill="off"
              name="address2"
              onChange={(event) => handlers.updateRequest(event.target.id, event.target.value)}
              value={state.address2}
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> City</InputLabel>
            <Input
              id="city"
              type="text"
              autoComplete="new-password"
              autofill="off"
              name="city"
              onChange={(event) => handlers.updateRequest(event.target.id, event.target.value)}
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
              isClearable
              isSearchable
              onChange={(event) => handlers.updateRequest("state", event.value)}
              value={{ value: state.state, label: state.state }}
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
              autofill="off"
              name="zip"
              onChange={(event) => handlers.updateRequest(event.target.id, event.target.value)}
              value={state.zip}
              onFocus={(event) => handlers.updateRequest(event.target.id, "")}
            />
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
            onChange={(event) => handlers.updateRequest("priority", event.value)}
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