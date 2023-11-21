import React, { useContext, useEffect } from "react";
import { FormContext } from "../MultipartForm";
import { validateAllInputs } from "./inputs/Inputs";
import { useDispatch, useSelector } from "react-redux";
import { SingleLayoutDynamicForm } from "./SingleLayoutDynamicForm";
import { SplitLayoutDynamicForm } from "./SplitLayoutDynamicForm";
import { sleep } from "../../../utilities";
import { findLast } from "lodash";

export const MultipartDynamicForm = () => {
  const formState = useContext(FormContext);
  const { slides, splitLayout } = formState.config;
  const dispatch = useDispatch();
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  const MIN_SLIDES_INDEX = 0;
  const MAX_SLIDES_INDEX = slides.length - 1;

  const bounded = (index) => {
    if (index < MIN_SLIDES_INDEX) return MIN_SLIDES_INDEX;
    if (index > MAX_SLIDES_INDEX) return MAX_SLIDES_INDEX;
    return index;
  };

  const getNextSlide = (current_index, direction) => {
    let next = current_index;
    if (direction === "backward") {
      next = findLast(slides, (slide) => slide.lifecycle.shouldRender(formState.stateRetriever, formState.helpers), bounded(current_index - 1)).index;
    } else if (direction === "forward") {
      let active_slides = slides.slice(bounded(current_index + 1), MAX_SLIDES_INDEX);
      if (current_index < MAX_SLIDES_INDEX) active_slides = slides.slice(bounded(current_index + 1));
      if (active_slides.length) next = active_slides.find((slide) => slide.lifecycle.shouldRender(formState.stateRetriever, formState.helpers))?.index;
    }
    return next;
  };

  const prevented = (func) => (event) => {
    event.preventDefault();
    func();
  };

  const prevSlide = async () => {
    const targetSlide = getNextSlide(current_slide, "backward");
    const { onLoad } = slides[targetSlide].lifecycle;
    const { onUnload } = slides[current_slide].lifecycle;
    dispatch(formState.changeFormSlide(targetSlide));
    if (onLoad) await onLoad(formState.stateConsumer, formState.helpers, formState.stateRetriever, formState.bulkComposeState);
    if (onUnload) onUnload(formState.stateConsumer, formState.helpers, formState.stateRetriever, formState.bulkComposeState);
    dispatch(formState.stepComplete(slides[targetSlide].id, false));
  };

  const nextSlide = async () => {
    const { onSubmit, onUnload } = slides[current_slide].lifecycle;
    const { haltNext } = slides[current_slide].cta;
    const shouldHalt = haltNext ? haltNext(formState.stateRetriever) : false;
    if (onSubmit) {
      formState.stateConsumer(`loading_step_${current_slide}`, true, "registration_config");
      await onSubmit(formState.stateRetriever, formState.stateConsumer, formState.helpers);
      await sleep(1000);
      formState.stateConsumer(`loading_step_${current_slide}`, false, "registration_config");
    }
    if (!shouldHalt) {
      const targetSlide = getNextSlide(current_slide, "forward");
      if ((targetSlide <= MAX_SLIDES_INDEX)) {
        const { onLoad } = slides[targetSlide].lifecycle;
        dispatch(formState.changeFormSlide(targetSlide));
        if (onLoad) await onLoad(formState.stateConsumer, formState.helpers, formState.stateRetriever, formState.bulkComposeState);
        if (onUnload) onUnload(formState.stateConsumer, formState.helpers, formState.stateRetriever, formState.bulkComposeState);
        dispatch(formState.stepComplete(slides[current_slide].id, true));
      }
    }
  };

  // Ensure that the onLoad function gets ran on the first slide
  useEffect(() => {
    let startingSlide = slides[current_slide];
    let active_slides = slides.slice(bounded(current_slide), MAX_SLIDES_INDEX);
    if (current_slide < MAX_SLIDES_INDEX) active_slides = slides.slice(bounded(current_slide));
    if (active_slides.length) startingSlide = active_slides.find((slide) => slide.lifecycle.shouldRender(formState.stateRetriever, formState.helpers));
    if (!startingSlide) startingSlide = active_slides[0]; 
    dispatch(formState.changeFormSlide(startingSlide ? startingSlide.index : 0));
    if (startingSlide && startingSlide.lifecycle.onLoad) {
      async function onLoad() {
        await startingSlide.lifecycle.onLoad(formState.stateConsumer, formState.helpers, formState.stateRetriever, formState.bulkComposeState);
      }
      onLoad();
    }
    // We only care about this running on the first mount - similar to componentDidMount()
    // eslint-disable-next-line
  }, []);

  // Whenever the page changes, validate all the fields (pre-filled or not)
  // to asses whether or not the user can continue to the next page
  useEffect(() => {
    const slideConfig = slides[current_slide];
    validateAllInputs(slideConfig, formState);
  }, [slides, current_slide, formState]);

  const LAYOUT_PROPS = {
    slides,
    nextSlideHandler: prevented(nextSlide),
    prevSlideHandler: prevented(prevSlide)
  };

  return splitLayout
    ? <SplitLayoutDynamicForm {...LAYOUT_PROPS} />
    : <SingleLayoutDynamicForm {...LAYOUT_PROPS} />;
};