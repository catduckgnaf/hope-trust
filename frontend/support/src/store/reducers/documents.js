import {
  HAS_FETCHED_DOCUMENTS,
  IS_FETCHING_DOCUMENTS,
  GET_DOCUMENTS,
  UPDATE_DOCUMENT,
  DELETE_DOCUMENT,
  OPEN_CREATE_DOCUMENT_MODAL,
  CLOSE_CREATE_DOCUMENT_MODAL,
  UPDATE_DOCUMENT_USAGE,
  CLEAR_ALL
} from "../actions/constants";

const defaultState = {
  requested: false,
  isFetching: false,
  documents: [],
  creatingDocument: false,
  file: false,
  defaults: {},
  updating: false,
  viewing: false,
  usage: 0
};
const documentsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_DOCUMENTS:
      return { ...state, documents: payload, isFetching: false, requested: true };
    case DELETE_DOCUMENT:
      const old_docs_before_delete = state.documents;
      const new_docs_after_delete = old_docs_before_delete.filter((doc) => doc.filename !== payload);
      return { ...state, documents: new_docs_after_delete };
    case UPDATE_DOCUMENT:
      const old_docs_before_edit = state.documents;
      const new_docs_after_edit = old_docs_before_edit.filter((doc) => doc.id !== payload.id);
      return { ...state, documents: [...new_docs_after_edit, payload] };
    case UPDATE_DOCUMENT_USAGE:
      return { ...state, usage: payload };
    case OPEN_CREATE_DOCUMENT_MODAL:
      return {...state, creatingDocument: true, file: payload.file, defaults: payload.defaults, updating: payload.updating, viewing: payload.viewing };
    case CLOSE_CREATE_DOCUMENT_MODAL:
      return {...state, creatingDocument: false, file: false, defaults: {}, updating: false, viewing: false };
    case IS_FETCHING_DOCUMENTS:
      return { ...state, isFetching: payload };
    case HAS_FETCHED_DOCUMENTS:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default documentsReducer;
