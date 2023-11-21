import React, { useContext, useState } from "react";
import { FormContext } from "../../MultipartForm";
import { useSelector } from "react-redux";
import { StyledFormSelect } from "./styles";
import { validateAllInputs, validateInput } from "./Inputs";

export const FormSelect = (props) => {
  const formState = useContext(FormContext);
  const { stateRetriever, stateConsumer, stateCollection, helpers, config } = formState;
  let { id, input_key, required, options = [], disabled, valueFormatter, onChange, onValid, onInvalid, local = false } = props;
  const { slides } = config;
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  const storedValue = useSelector((state) => state[stateCollection][slides[current_slide].collector][id]) || "";
  const [isValid, setIsValid] = useState(true);
  
  const handleChange = (event) => {
    const newValue = event.target.value;
    if (onChange) onChange(newValue, helpers, stateConsumer, stateRetriever);
    stateConsumer(id, newValue, slides[current_slide].collector, local);
    validateAllInputs(slides[current_slide], formState);
  };

  const validateChange = (event) => {
    const attemptedValue = event.target.value;
    const validationResult = validateInput(attemptedValue, props, stateRetriever);
    if (validationResult && onValid) onValid(stateRetriever, stateConsumer, helpers);
    if (!validationResult && onInvalid) onInvalid(stateRetriever, stateConsumer, helpers);
    if (attemptedValue) setIsValid(validationResult);
  };

  if (typeof options === "function") options = options(stateRetriever, helpers);

  const override_validation = [];

  return (
    <StyledFormSelect
      disabled={disabled}
      id={id}
      key={input_key}
      required={required}
      valid={override_validation.some((e) => e(storedValue, id)) ? true : (isValid || !storedValue)}
      value={valueFormatter ? valueFormatter(storedValue || "") : storedValue || ""}
      onChange={handleChange}
      onBlur={validateChange}
      onFocus={validateChange}
    >
      <option disabled value="">Choose an option</option>
      {options && options.length
        ? (
          <>
            {options.map((opt, index) => <option key={index} value={opt.value}>{opt.label}</option>)}
          </>
        )
        : null
      }
    </StyledFormSelect>
  );
};