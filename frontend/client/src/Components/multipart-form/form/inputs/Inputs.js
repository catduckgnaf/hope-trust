import React from "react"; 
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import moment from "moment";

const IS_TRUE = (val) => val === true;

export function resolveComponentFromDefinition(inputDefinition, formState) {
  const { disableIf = () => false, Component, type = () => null } = inputDefinition;
  const isDisabled = disableIf(formState.stateRetriever);
  switch (type(formState.stateRetriever)) {
    case "selection": 
      return <FormSelect disabled={isDisabled} {...inputDefinition} />;
    case "component":
      return <Component {...inputDefinition} helpers={formState.helpers} stateRetriever={formState.stateRetriever} stateConsumer={formState.stateConsumer} bulkComposeState={formState.bulkComposeState} />;
    default:
      return <FormInput disabled={isDisabled} {...inputDefinition} />;
  }
}

export function validateInput(targetInput, inputDefiniton, stateRetriever) {
  const { required, validators, maxLength, minLength, minNumberValue, maxNumberValue, minDate, maxDate} = inputDefiniton;
  if (!required && !targetInput) return true;
  if (required && !targetInput) return false;
  
  if (targetInput && maxLength && targetInput.length > maxLength) return false;
  if (targetInput && minLength && targetInput.length < minLength) return false;
  if (targetInput && minNumberValue && parseFloat(targetInput) < minNumberValue) return false;
  if (targetInput && maxNumberValue && parseFloat(targetInput) > maxNumberValue) return false;
  if (targetInput && maxDate && moment(targetInput).isAfter(moment(maxDate))) return false;
  if (targetInput && minDate && moment(targetInput).isBefore(moment(minDate))) return false;
  if (targetInput && Array.isArray(targetInput) && targetInput.length) return true;

  if (!validators) return true;

  const validationMatrix = validators.map((validatorFunc) => validatorFunc(targetInput, stateRetriever));
  const isValid = validationMatrix.every(IS_TRUE);
  return isValid;
}

export function validateAllInputs(currentSlide, formState) {
  const { stateRetriever, formValidationState } = formState;
  const setFormValidation = formValidationState[1];
  const rendered_inputs = currentSlide.form ? currentSlide.form.filter((i) => i.renderInput ? i.renderInput(formState.stateRetriever, formState.helpers) : true) : [];
  const inputs = currentSlide.form && rendered_inputs.length ? rendered_inputs.flat(2) : [];
  const component_validators = currentSlide.Component ? currentSlide.component_validators : [];

  const globalValidationMatrix = inputs.map((inputDefinition) => {
    const storedValue = stateRetriever(inputDefinition.id, inputDefinition.local);
    return validateInput(storedValue, inputDefinition, stateRetriever);
  });

  const globalValidation = globalValidationMatrix.every(IS_TRUE);
  const componentValidation = component_validators.length ? component_validators.every((func) => func(stateRetriever)) : true;
  setFormValidation(globalValidation && componentValidation);

  return globalValidation;
}