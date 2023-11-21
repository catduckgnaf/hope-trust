import React, { useContext } from "react";
import { FormContext } from "../MultipartForm";
import { useDispatch, useSelector } from "react-redux";
import * as Single from "../layouts/single-layout.styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { FormButton } from "../elements.styles";
import { FormInputsController } from "./inputs/FormInputsController";
import { findLast } from "lodash";

export const SingleLayoutDynamicForm = (props) => {
  const { slides, nextSlideHandler, prevSlideHandler } = props;
  
  const formState = useContext(FormContext);
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  const [formValidated] = formState.formValidationState;
  const dispatch = useDispatch();
  const hasPrevious = findLast(slides, (slide) => slide.lifecycle.shouldRender(formState.stateRetriever, formState.helpers), (current_slide - 1));
  const hideAdditional = slides[current_slide].cta.additionalButton && slides[current_slide].cta.additionalButton.hide ? slides[current_slide].cta.additionalButton.hide(formState.stateRetriever) : false;
  const additional_props = slides[current_slide].cta.props ? slides[current_slide].cta.props(formState.stateRetriever) : {};
  const hideNextButton = slides[current_slide].cta.hasOwnProperty("hideNext") ? slides[current_slide].cta.hideNext(formState.stateRetriever) : false;

  return (
    <Single.MultipartFormForm>
      <Single.FormInputsContainer>
        {slides[current_slide].form
          ? <FormInputsController />
          : slides[current_slide].Component(formState.stateRetriever, formState.stateConsumer, formState.helpers, formState.bulkComposeState)
        }
      </Single.FormInputsContainer>
      <Single.FormActions>
        {!hideNextButton
          ? (
            <FormButton
              {...additional_props}
              primary
              type="button"
              disabled={!formValidated || formState.stateRetriever(`loading_step_${current_slide}`)}
              onClick={async (e) => {
                if (slides[current_slide].cta.action) await slides[current_slide].cta.action(formState.stateRetriever, formState.stateConsumer, formState.helpers);
                nextSlideHandler(e);
              }}
            >
              {!formState.stateRetriever(`loading_step_${current_slide}`)
                ? slides[current_slide].cta.actionLabel(formState.stateRetriever)
                : <FontAwesomeIcon icon={["fad", "spinner"]} spin />
              }
            </FormButton>
          )
          : null
        }
        {slides[current_slide].cta.additionalButton && !hideAdditional
          ? (
            <FormButton
              primary
              disabled={slides[current_slide].cta.additionalButton.disabled ? slides[current_slide].cta.additionalButton.disabled(formState.stateRetriever) : false}
              type="button"
              onClick={async (e) => {
                await slides[current_slide].cta.additionalButton.action(formState.stateRetriever, formState.stateConsumer, formState.helpers);
                nextSlideHandler(e);
              }}
            >
              {slides[current_slide].cta.additionalButton.actionLabel(formState.stateRetriever)}
            </FormButton>
          )
          : null
        }
        {(current_slide !== 0) && (slides[current_slide].hidePrevious ? !slides[current_slide].hidePrevious(formState.stateRetriever) : true) && hasPrevious
          ? <FormButton type="button" secondary onClick={(e) => {
            if (slides[current_slide].previousAction) dispatch(slides[current_slide].previousAction(formState.stateRetriever, formState.stateConsumer, formState.bulkComposeState, formState.helpers));
            else prevSlideHandler(e);
          }}>Previous Step</FormButton>
          : null
        }
      </Single.FormActions>
    </Single.MultipartFormForm>
  );
};