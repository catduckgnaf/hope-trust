import React, { useState, createContext } from "react";
import { changeFormSlide, stepComplete } from "../../store/actions/multipart-form";
import { SplitLayout } from "./layouts/SplitLayoutForm";
import { SingleLayout } from "./layouts/SingleLayoutForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class MultipartFormConfig {
  constructor(options) {
    this.splitLayout = options.splitLayout;
    this.slides = options.slides
    .map((slide, index) => {
      return { ...slide, index, complete: false };
    });
    this.banner = options.banner;
    this.banner_text = options.banner_text;
  }
}

export const FormContext = createContext();

export const MultipartForm = (props) => {
  const { config, stateCollection, stateConsumer, stateRetriever, bulkComposeState, helpers, loading = false } = props;
  const formValidationState = useState(false);
  const slides = config.slides.filter((slide) => slide.lifecycle.shouldRender(stateRetriever, helpers));

  const formContextObject = {
    config: { ...config, slides },
    stateConsumer,
    bulkComposeState,
    stateRetriever,
    stateCollection,
    formValidationState,
    changeFormSlide,
    stepComplete,
    helpers
  };

  return (
    <FormContext.Provider value={formContextObject}>
      {!loading
        ? <>{props.config.splitLayout ? <SplitLayout /> : <SingleLayout />}</>
        : <FontAwesomeIcon icon={["fad", "spinner"]} size="5x" spin />
      }
    </FormContext.Provider>
  );
};