import React from "react";
import {
  ViewContainer,
  InputWrapper,
  InputLabel,
  SelectLabel,
  Input,
  TextArea,
  Button,
  RequiredStar,
  FormError
} from "../../../../global-components";
import { AutoCompleteItem, CustomDates, MetaMessage } from "./style";
import CustomDateInput from "../../../../Components/CustomDateInput";
import Autocomplete from "react-autocomplete";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import moment from "moment";

const isFuture = (date) => {
  return date.isAfter(moment(), "minute");
};

const capitalize = (str, lower = false) => ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

export const buildRequestBody = (state, steps, handlers) => {
  switch(steps[state.currentStep].title) {
    case "Reason":
      const request_types = [
        { value: "medical appointment", label: "Medical Appointment" },
        { value: "diagnostic test", label: "Diagnostic Test" },
        { value: "medication refill", label: "Medication Refill" },
        { value: "other", label: "Other" }
      ];
      const subcategory = request_types.find((item) => item.value === state.request_subcategory);
      return (
        <ViewContainer>
          <InputWrapper>
            <InputLabel><RequiredStar>*</RequiredStar> Reason for this request ({255 - state.notes.length} characters remaining)</InputLabel>
            <TextArea maxLength={255} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} paddingtop={10} placeholder="ie: My knee hurts" id="notes" onChange={(event) => handlers.updateRequestBody(event.target.id, event.target.value)} defaultValue={state.notes}></TextArea>
          </InputWrapper>

          <InputWrapper>
            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Medical Request Type</InputLabel>
            <CreatableSelect
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
              menuPlacement="auto"
              maxMenuHeight={250}
              onChange={(event) => handlers.updateRequestBody("request_subcategory", event ? event.value : "")}
              value={subcategory ? subcategory : (state.request_subcategory) ? { value: state.request_subcategory, label: capitalize(state.request_subcategory) } : null}
              options={request_types}
              onCreateOption={(value) => handlers.updateRequestBody("request_subcategory", value)}
              formatCreateLabel={(value) => `Click or press Enter to create new issue "${value}"`}
            />
          </InputWrapper>
        </ViewContainer>
      );
    case "Doctor":
      return (
        <ViewContainer textalign="center">
          {state.permissions.includes("health-and-life-view")
            ? (
              <>
                {state.providers.length && !state.find_new
                  ? (
                    <Autocomplete
                      getItemValue={(item) => item.name}
                      items={[{ id: "new", name: "New Provider" }, ...state.providers.filter((p) => p.type === "medical")]}
                      renderInput={(props) => {
                        return (
                          <InputWrapper marginbottom={1}>
                            <InputLabel>Provider</InputLabel>
                            <SelectLabel>
                              <Input placeholder="Choose a provider..." {...props} />
                            </SelectLabel>
                          </InputWrapper>
                        );
                      }}
                      renderItem={(item, isHighlighted) => {
                        return (
                          <AutoCompleteItem key={item.id} style={{ background: isHighlighted ? "lightgray" : "white" }}>
                            {item.name}{(item.contact_first && item.contact_last) ? ` - ${item.contact_first} ${item.contact_last}` : null}
                          </AutoCompleteItem>
                        );
                      }}
                      menuStyle={{
                        borderRadius: "6px",
                        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "2px 0",
                        fontSize: "90%",
                        position: "fixed",
                        overflow: "auto",
                        maxHeight: "50%",
                        zIndex: 2,
                        textAlign: "left"
                      }}
                      wrapperStyle={{
                        width: "100%"
                      }}
                      value={state.provider.name}
                      onSelect={(value, item) => {
                        if (value === "New Provider") {
                          handlers.newProvider();
                        } else {
                          handlers.updateRequestBody("find_new", false);
                          handlers.updateRequestBody("provider", item);
                          handlers.updateRequestBody("provider_acknowledged", true);
                        }
                      }}
                    />
                  )
                  : null
                }
              </>
            )
            : <MetaMessage>You do not have permission to view providers.</MetaMessage>
          }
          {!state.find_new
            ? <Button small nomargin marginbottom={20} margintop={20} blue onClick={() => {
              handlers.updateRequestBody("find_new", true);
              handlers.updateRequestBody("provider_acknowledged", true);
              handlers.updateRequestBody("provider", false);
            }}>Find me a provider</Button>
            : null
          }
          {state.find_new && state.providers.length
            ? (
              <>
                <MetaMessage>We will find a provider that fits your needs.</MetaMessage>
                <Button small marginbottom={10} blue onClick={() => {
                  handlers.updateRequestBody("find_new", false);
                  handlers.updateRequestBody("provider_acknowledged", false);
                }}>Choose a provider</Button>
              </>
            )
            : null
          }

          {!state.providers.length
            ? (
              <>
                {state.find_new
                  ? <MetaMessage>We will find a provider that fits your needs.</MetaMessage>
                  : null
                }
                <Button small marginbottom={10} blue onClick={() => handlers.newProvider()}>Create Provider</Button>
              </>
            )
            : null
          }
        </ViewContainer>
      );
    case "Dates":
      const updateDate = (date, type) => {
        handlers.updateRequestBody(`date_${type}_error`, false);
        handlers.updateDateChoices(type, date);
      };
      const throwError = (type) => {
        handlers.updateRequestBody(`date_${type}_error`, true);
        setTimeout(() => {
          handlers.updateRequestBody(`date_${type}_error`, false);
        }, 3500);
      };
      return (
        <ViewContainer>
          <CustomDates>
            <InputWrapper marginbottom={5}>
              <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Choose some dates that work for you</InputLabel>
              <DatePicker
                selected={state.date_choices[0]}
                onChange={(date) => isFuture(moment(date)) ? updateDate(date, 0) : throwError(0)}
                showTimeSelect
                timeFormat="h:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                customInput={<CustomDateInput />}
                placeholderText="Choose a date and time"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                withPortal
                minDate={new Date()}
              />
              <FormError>{state.date_0_error ? "Date must be in the future." : ""}</FormError>
            </InputWrapper>
            <InputWrapper marginbottom={5}>
              <DatePicker
                selected={state.date_choices[1]}
                onChange={(date) => isFuture(moment(date)) ? updateDate(date, 1) : throwError(1)}
                showTimeSelect
                timeFormat="h:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                customInput={<CustomDateInput />}
                placeholderText="Choose a date and time"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                withPortal
                minDate={new Date()}
              />
              <FormError>{state.date_1_error ? "Date must be in the future." : ""}</FormError>
            </InputWrapper>
            <InputWrapper marginbottom={5}>
              <DatePicker
                selected={state.date_choices[2]}
                onChange={(date) => isFuture(moment(date)) ? updateDate(date, 2) : throwError(2)}
                showTimeSelect
                timeFormat="h:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                customInput={<CustomDateInput />}
                placeholderText="Choose a date and time"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                withPortal
                minDate={new Date()}
              />
              <FormError>{state.date_2_error ? "Date must be in the future." : ""}</FormError>
            </InputWrapper>
          </CustomDates>
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