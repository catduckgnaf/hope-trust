
import React, { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FormInputGroup,
  FormLabel,
  LabelHint,
  FormGroup
} from "../../elements.styles";
import { FormContext } from "../../MultipartForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { resolveComponentFromDefinition } from "./Inputs";

function mapDefinitionToElement(inputDefinition, formState) {
  const { renderInput, id, input_key, label, hint, required, validation_error, input_appendage, local } = inputDefinition;
  const has_error = validation_error ? validation_error(formState.stateRetriever) : null;
  const shouldRenderInput = renderInput ? renderInput(formState.stateRetriever, formState.helpers) : true;
  if (shouldRenderInput) {
    return (
      <FormInputGroup key={`${input_key}_${id}`}>
        <FormLabel htmlFor={id} required={required ? 1 : 0}>
          {label}
          {formState.stateRetriever(`is_loading_${id}`)
            ? <LabelHint><FontAwesomeIcon icon={["fad", "spinner"]} spin /></LabelHint>
            : (
              <>
                {has_error && formState.stateRetriever(id, local)
                  ? has_error
                  : (
                    <>
                      {hint ? (<LabelHint>{hint}</LabelHint>) : null}
                    </>
                  )
                }
              </>
            )
          }
        </FormLabel>
        {resolveComponentFromDefinition(inputDefinition, formState)}
        {input_appendage
          ? input_appendage(formState.stateRetriever, formState.helpers, formState.stateConsumer)
          : null
        }
      </FormInputGroup>
    );
  }
  return null;
}

export const FormInputsController = () => {
  const formState = useContext(FormContext);
  const { slides } = formState.config;
  
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  const [formElements, setFormElements] = useState([]);

  useEffect(() => {
    const inputs = slides[current_slide].form;
    const elements = [];

    inputs.forEach((input, index) => {
      let mapping = mapDefinitionToElement(input, formState);
      
      if (Array.isArray(input)) {
        mapping = (
          <FormGroup key={index}>
            {input.map((child) => mapDefinitionToElement(child, formState))}
          </FormGroup>
        );
      }

      elements.push(mapping);
    });

    setFormElements(elements);
  }, [slides, current_slide, formState]);

  return formElements;
};