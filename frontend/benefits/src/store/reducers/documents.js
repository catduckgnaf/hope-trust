import {
  LOCATION_CHANGE,
  UPDATE_DOCUMENTS_VIEW,
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
import { sortBy } from "lodash";

const defaultState = {
  requested: false,
  isFetching: false,
  documents: [],
  foldered: {},
  folders: [],
  creatingDocument: false,
  file: false,
  defaults: {},
  updating: false,
  viewing: false,
  view: "folder",
  usage: 0
};
const documentsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_DOCUMENTS:
      payload = sortBy(payload, "created_at").reverse();
      let folders = {};
      payload.forEach((document) => {
        const folder_name = document.filename.includes("/") ? document.filename.split("/")[0] : "Other";
        if (folders[folder_name]) {
          folders[folder_name].push({ ...document, filename: folder_name !== "Other" ? document.filename.split("/")[1] : document.filename, original_name: document.filename});
        } else {
          folders[folder_name] = [{ ...document, filename: folder_name !== "Other" ? document.filename.split("/")[1] : document.filename, original_name: document.filename}];
        }
      });
      return { ...state, documents: payload, isFetching: false, requested: true, folders: Object.keys(folders), foldered: folders };
    case DELETE_DOCUMENT:
      const current_folders = state.foldered;
      const folder_name = payload.includes("/") ? payload.split("/")[0] : "Other";
      const remaining_in_folder = current_folders[folder_name].filter((document) => document.original_name !== payload);
      let new_state = {};
      let view = state.view;
      new_state.foldered = { ...current_folders };
      if (remaining_in_folder.length) {
        new_state.foldered[folder_name] = remaining_in_folder;
      } else {
        delete new_state.foldered[folder_name];
        view = "folder";
      }
      new_state.folders = Object.keys(new_state.foldered);
      return { ...state, documents: state.documents.filter((document) => document.filename !== payload), ...new_state, view };
    case UPDATE_DOCUMENT:
      const update_folder_name = payload.data.filename.includes("/") ? payload.data.filename.split("/")[0] : "Other";
      const update_current_folders = state.foldered;
      const update_remaining_in_folder = update_current_folders[update_folder_name].filter((document) => document.id !== payload.id);
      let update_new_state = {};
      update_new_state.foldered = { ...update_current_folders };
      update_new_state.foldered[update_folder_name] = [...update_remaining_in_folder, { ...payload.data, filename: update_folder_name !== "Other" ? payload.data.filename.split("/")[1] : payload.data.filename, original_name: payload.data.filename }];
      update_new_state.folders = Object.keys(update_new_state.foldered);

      const preserved_documents = state.documents.filter((document) => document.id !== payload.id);
      return {...state, documents: [ ...preserved_documents, payload.data ], ...update_new_state };
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
    case UPDATE_DOCUMENTS_VIEW:
      return { ...state, view: payload };
    case LOCATION_CHANGE:
      return { ...state, view: "folder" };
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default documentsReducer;
