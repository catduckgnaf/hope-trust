import { API } from "aws-amplify";
import axios from "axios";
import { apiGateway } from "../../config";
import { toastr } from "react-redux-toastr";
import {
  HAS_FETCHED_DOCUMENTS,
  IS_FETCHING_DOCUMENTS,
  UPDATE_DOCUMENT,
  GET_DOCUMENTS,
  DELETE_DOCUMENT,
  CLOSE_CREATE_DOCUMENT_MODAL,
  OPEN_CREATE_DOCUMENT_MODAL,
  UPDATE_DOCUMENT_USAGE
} from "./constants";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getDocuments = (override = false) => async (dispatch) => {
  if (!store.getState().documents.isFetching && (!store.getState().documents.requested || override)) {
      dispatch({ type: IS_FETCHING_DOCUMENTS, payload: true });
      try {
        const data = await API.get(
          Gateway.name,
          `/documents/get-account-documents/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
          {
            headers: {
              "Authorization": store.getState().session.token
            }
          });
          if (data.success) {
            dispatch({ type: GET_DOCUMENTS, payload: data.payload });
            dispatch({ type: UPDATE_DOCUMENT_USAGE, payload: data.usage });
            dispatch({ type: IS_FETCHING_DOCUMENTS, payload: false });
          } else {
            dispatch({ type: GET_DOCUMENTS, payload: [] });
            dispatch({ type: UPDATE_DOCUMENT_USAGE, payload: 0 });
            dispatch({ type: HAS_FETCHED_DOCUMENTS, payload: true });
            dispatch({ type: IS_FETCHING_DOCUMENTS, payload: false });
          }
          return data.success;
      } catch (error) {
        dispatch({ type: UPDATE_DOCUMENT_USAGE, payload: error.response.data.usage });
        dispatch({ type: HAS_FETCHED_DOCUMENTS, payload: true });
        dispatch({ type: IS_FETCHING_DOCUMENTS, payload: false });
        return {
          success: false,
          error
        };
      }
    }
};

export const createDocument = (newDocument, blob, type) => async (dispatch) => {
  const signedURL = await API.post(
    Gateway.name,
    `/documents/get-signed-url/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        "Authorization": store.getState().session.token
      },
      body: {
        key: newDocument.filename,
        method: "putObject",
        type
      }
    });
  if (signedURL) {
    const document = await axios.put(decodeURIComponent(signedURL.payload), blob, {
      disableMultipart: true,
      headers: {
        "Content-Type": type,
        "Content-Encoding": type
      },
    });

    if (document.status === 200) {
    const created = await API.post(
    Gateway.name,
    `/documents/create/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        "Authorization": store.getState().session.token
      },
      body: {
        newDocument
      }
    });
      if (created.success) {
        dispatch({ type: HAS_FETCHED_DOCUMENTS, payload: false });
        dispatch(getDocuments(true));
      }
      return created;
    } else {
      return { success: false };
    }
  } else {
    return { success: false };
  }
};

export const getDocument = (key, associated_account_id) => async (dispatch) => {
  const document = await API.post(
    Gateway.name,
    `/documents/get-single-document/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        "Authorization": store.getState().session.token
      },
      body: {
        key,
        associated_account_id
      }
    });
  return document;
};

export const updateDocument = (id, updates, new_file_config) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/documents/update-single-document/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        new_file_config,
        updates,
        id
      }
    }).then((data) => {
      dispatch({ type: UPDATE_DOCUMENT, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteDocument = (target_account_id, key, friendly) => async (dispatch) => {
  dispatch({ type: DELETE_DOCUMENT, payload: key });
  const deleted = await API.patch(
    Gateway.name,
    `/documents/delete-single-document/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        "Authorization": store.getState().session.token
      },
      body: {
        key,
        target_account_id
      }
    });
  if (deleted.success) {
    toastr.success("Document deleted", `We successfully deleted your document "${friendly}"`);
  } else {
    toastr.error("Delete failed", "We could not delete this document. Try again.");
  }
};

export const openCreateDocumentModal = (file, defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_DOCUMENT_MODAL, payload: { file, defaults, updating, viewing } });
};

export const closeCreateDocumentModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_DOCUMENT_MODAL });
};