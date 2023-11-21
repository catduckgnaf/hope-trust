import React, { useContext } from "react";
import { FormContext } from "../MultipartForm";
import { useDispatch, useSelector } from "react-redux";
import * as Split from "./split-layout.styles";

import {
  MultipartFormTitle,
  MultipartFormSecondaryCTA
} from "../elements.styles";

import { MultipartDynamicForm } from "../form/MultipartDynamicForm";
import { MultipartDynamicSidebar } from "../MultipartDynamicSidebar";

export const SplitLayout = () => {
  const formState = useContext(FormContext);
  const { slides } = formState.config;
  const dispatch = useDispatch();
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  
  return (
    <Split.MultipartFormWrapper>
      {slides[current_slide].sidebar
        ? <MultipartDynamicSidebar />
        : null
      }
      <Split.MultipartFormBody sidebar={slides[current_slide].sidebar ? 1 : 0}>
        <Split.MultipartFormHeader>
          <MultipartFormTitle>{slides[current_slide].title(formState.stateRetriever, formState.helpers)}</MultipartFormTitle>
          {slides[current_slide].secondaryCta
            ? <MultipartFormSecondaryCTA position={slides[current_slide].secondaryCta.position} onClick={() => {
              if (slides[current_slide].secondaryCta.action) dispatch(slides[current_slide].secondaryCta.action(formState.stateRetriever, formState.helpers));
              if (slides[current_slide].secondaryCta.helper) slides[current_slide].secondaryCta.helper(formState.stateRetriever, formState.helpers);
            }}>{slides[current_slide].secondaryCta.label}</MultipartFormSecondaryCTA>
            : null
          }
        </Split.MultipartFormHeader>
        <MultipartDynamicForm />
      </Split.MultipartFormBody>
    </Split.MultipartFormWrapper>
  );
};