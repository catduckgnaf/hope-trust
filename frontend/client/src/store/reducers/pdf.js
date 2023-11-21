import { CONVERT_MARKDOWN, CLOSE_PDF_MODAL, CLEAR_ALL } from "../actions/constants";

const defaultState = { source: "", title: "", viewing_pdf: false };
const pdfReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case CONVERT_MARKDOWN:
      return { source: payload.source, title: payload.title, viewing_pdf: true };
    case CLOSE_PDF_MODAL:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default pdfReducer;
