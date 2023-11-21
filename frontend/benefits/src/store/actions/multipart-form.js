import { CHANGE_FORM_SLIDE, CHANGE_STEP_COMPLETION, CLEAR_MULTI_PART_FORM } from "./constants";

export const changeFormSlide = (slide) => async (dispatch) => {
  dispatch({ type: CHANGE_FORM_SLIDE, payload: slide });
};

export const stepComplete = (step, status) => async (dispatch) => {
  dispatch({ type: CHANGE_STEP_COMPLETION, payload: { step, status } });
};

export const clearMultipartForm = () => async (dispatch) => {
  dispatch({ type: CLEAR_MULTI_PART_FORM });
};