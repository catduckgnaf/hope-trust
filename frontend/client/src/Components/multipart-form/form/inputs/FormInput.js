import React, { useState, useContext } from "react";
import { FormContext } from "../../MultipartForm";
import { validateAllInputs, validateInput } from "./Inputs";
import { StyledFormInput } from "./styles";
import { useSelector } from "react-redux";
import moment from "moment";

export const FormInput = (props) => {
  const formState = useContext(FormContext);
  const { stateCollection, stateConsumer, stateRetriever, helpers, config } = formState;
  const { value, id, input_key, type, required, placeholder, maxLength = 100, minLength, maxNumberValue, minNumberValue = 0, maxDate, minDate, valueFormatter, onKeyUp, onKeyDown, onKeyPress, autoComplete, disabled, autoFocus, onChange, onValid, onInvalid, local = false } = props;
  const { slides } = config;
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  const globalValue = useSelector((state) => state[stateCollection][slides[current_slide].collector][id]) || "";
  const storedValue = value ? value(formState.stateRetriever) : globalValue;
  const [isValid, setIsValid] = useState(true);

  const validate = (attemptedValue) => {
    const validationResult = validateInput(attemptedValue, props, stateRetriever);
    return validationResult;
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    const valid = validate(newValue);
    if (onChange) onChange(newValue, helpers, stateConsumer, stateRetriever);
    stateConsumer(id, newValue, slides[current_slide].collector, local);
    validateAllInputs(slides[current_slide], formState);
    if (valid && onValid) onValid(stateRetriever, stateConsumer, helpers);
    if (!valid && onInvalid) onInvalid(stateRetriever, stateConsumer, helpers);
  };

  const validateChange = (event) => {
    const attemptedValue = event.target.value;
    const validated = validate(attemptedValue);
    if (attemptedValue) setIsValid(validated);
  };

  const override_validation = [(v, id) => v && v.includes("email")];
  
  return (
    <StyledFormInput
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      disabled={disabled}
      id={id}
      key={input_key}
      type={type(stateRetriever)}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      minLength={minLength}
      max={maxDate ? moment(maxDate).format("YYYY-DD-MM") : maxNumberValue}
      min={minDate ? moment(minDate).format("YYYY-DD-MM") : minNumberValue}
      defaultValue={valueFormatter ? valueFormatter(storedValue) : storedValue}
      valid={override_validation.some((e) => e(storedValue, id)) ? true : (isValid || !storedValue)}
      onChange={handleChange}
      onBlur={validateChange}
      onFocus={validateChange}
      onKeyUp={onKeyUp ? (event) => onKeyUp(event, formState.helpers, formState.stateConsumer, formState.stateRetriever) : null}
      onKeyDown={onKeyDown ? (event) => onKeyDown(event, formState.helpers, formState.stateConsumer, formState.stateRetriever) : null}
      onKeyPress={onKeyPress ? (event) => onKeyPress(event, formState.helpers, formState.stateConsumer, formState.stateRetriever) : null}
    />
  );
};