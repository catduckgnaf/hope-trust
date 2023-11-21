import React, { useContext } from "react";
import { FormContext } from "../../MultipartForm";
import { useSelector } from "react-redux";
import { StyledFormSelect } from "./styles";

export const FormSelect = (props) => {
  const { stateRetriever, stateConsumer, stateCollection, helpers, config } = useContext(FormContext);
  let { id, input_key, required, options = [], disabled, valueFormatter, onChange, local = false } = props;
  
  const { slides } = config;
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  const storedValue = useSelector((state) => state[stateCollection][slides[current_slide].collector][id]) || "";
  
  const handleChange = (event) => {
    const newValue = event.target.value;
    if (onChange) onChange(newValue, helpers, stateConsumer, stateRetriever);
    stateConsumer(id, newValue, slides[current_slide].collector, local);
  };

  if (typeof options === "function") options = options(stateRetriever, helpers);

  return (
    <StyledFormSelect
      disabled={disabled}
      id={id}
      key={input_key}
      required={required}
      value={valueFormatter ? valueFormatter(storedValue || "") : storedValue || ""}
      onChange={handleChange}
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