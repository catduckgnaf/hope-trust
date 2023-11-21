import React, { useContext } from "react";
import { FormContext } from "../../Components/multipart-form/MultipartForm";
import { useSelector } from "react-redux";
import { SelectStyles } from "../../global-components";
import CreatableSelect from "react-select/creatable";

export const MultipleSelect = (props) => {
  const { stateRetriever, stateConsumer, stateCollection, helpers, config } = useContext(FormContext);
  let { hide_dropdown, clearable, id, component_key, placeholder, required, options = [], disabled, valueFormatter, onChange, default_values } = props;
  
  const { slides } = config;
  const defaults = default_values(stateRetriever, helpers);
  const current_slide = useSelector((state) => state.multi_part_form.slide);
  const storedValue = useSelector((state) => state[stateCollection][slides[current_slide].collector][id]) || "";

  const handleChange = (value, actionOptions) => {
    const current = stateRetriever(id) || [];
    switch (actionOptions.action) {
      case "remove-value":
        let difference = current.filter((state) => state !== actionOptions.removedValue.value);
        if (!difference.length) difference = defaults;
        stateConsumer(id, difference, slides[current_slide].collector);
        break;
      case "select-option":
        stateConsumer(id, value.map((e) => e.value), slides[current_slide].collector);
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        if (onChange(new_option.value, stateRetriever, stateConsumer)) stateConsumer(id, [...current, new_option.value], slides[current_slide].collector);
        break;
      case "pop-value":
        let diff = current.filter((state) => state !== actionOptions.removedValue.value);
        if (!diff.length) diff = defaults;
        stateConsumer(id, diff, slides[current_slide].collector);
        break;
      case "clear":
        stateConsumer(id, defaults, slides[current_slide].collector);
        break;
      default:
        break;
    }
  };

  if (typeof options === "function") options = options(stateRetriever, helpers);

  return (
    <CreatableSelect
      components={hide_dropdown ? { DropdownIndicator: () => null, IndicatorSeparator:() => null } : null}
      styles={{
        container: (base, state) => ({
          ...base,
          opacity: state.isDisabled ? ".5" : "1",
          backgroundColor: "white",
          zIndex: !hide_dropdown ? 1000 : 988,
          padding: "0 0.5rem",
          borderRadius: "4px",
          border: "1px solid #EBEDEE",
          maxWidth: "600px"
        }),
        multiValue: (base, state) => ({
          ...base,
          backgroundColor: state.data.isFixed ? "gray" : base.backgroundColor,
          borderRadius: "15px",
          padding: "2px 10px"
        }),
        multiValueLabel: (base, state) => {
          return state.data.isFixed
            ? { ...base, fontWeight: "bold", color: "white", paddingRight: 6 }
            : base;
        },
        multiValueRemove: (base, state) => {
          return state.data.isFixed ? { ...base, display: "none" } : base;
        },
        menu: (base) => ({
          ...base,
          zIndex: !hide_dropdown ? 1000 : 988
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: !hide_dropdown ? 1000 : 988
        }),
        placeholder: (base) => ({
          ...base,
          fontWeight: 300,
          fontSize: "12px",
          lineHeight: "13px",
          opacity: "0.5"
        }),
        control: (base) => ({
          ...base,
          ...SelectStyles,
          borderBottom: "none"
        }),
        valueContainer: (base) => ({
          ...base,
          fontSize: "13px",
          paddingLeft: 0
        })
      }}
      isSearchable
      isMulti
      isClearable={clearable}
      name={id}
      key={component_key}
      required={required}
      placeholder={placeholder}
      formatCreateLabel={(input) => `Click or press Enter to add "${input}" as an approved domain`}
      backspaceRemovesValue={false}
      onChange={handleChange}
      defaultValue={valueFormatter(storedValue || [])}
      noOptionsMessage={() => null}
      isValidNewOption={(value) => value && onChange(value, stateRetriever, stateConsumer)}
      options={options}
      isDisabled={disabled}
    />
  );
};