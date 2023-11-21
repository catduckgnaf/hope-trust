import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { showNotification } from "./notification";
import { UPDATE_MESSAGE, GET_MESSAGES, IS_FETCHING_MESSAGES, HAS_REQUESTED_MESSAGES, NEW_MESSAGE, OPEN_MESSAGE, SEND_MESSAGE, DELETE_MESSAGE, DELETE_MESSAGES, CLOSE_MESSAGE } from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getMessages = (override, cognito_id) => async (dispatch) => {
  if ((!store.getState().message.isFetching && !store.getState().message.requested) || override) {
    dispatch({ type: IS_FETCHING_MESSAGES, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/messages/get-messages/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_MESSAGES, payload: data.payload });
        dispatch({ type: IS_FETCHING_MESSAGES, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_MESSAGES, payload: true });
        dispatch({ type: IS_FETCHING_MESSAGES, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_MESSAGES, payload: true });
      dispatch({ type: IS_FETCHING_MESSAGES, payload: false });
      return {
        success: false,
        error
      };
    }
  }
};

export const updateMessage = (id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/messages/update-message/${id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: UPDATE_MESSAGE, payload: data.payload });
      return data;
    }).catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const newMessage = (defaults) => async (dispatch) => {
  dispatch({ type: NEW_MESSAGE, payload: defaults });
};

export const openMessage = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_MESSAGE, payload: { defaults, updating, viewing, current_page } });
};

export const closeMessage = () => async (dispatch) => {
  dispatch({ type: CLOSE_MESSAGE });
};

export const sendMessage = (config, user) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/messages/send-message/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newMessage: config,
        user
      }
    }).then((data) => {
      dispatch(showNotification("success", "Message Sent", "Message sent successfully."));
      dispatch({ type: SEND_MESSAGE, payload: data.payload });
      dispatch({ type: CLOSE_MESSAGE });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) dispatch(showNotification("error", "Could not send your message.", error.response.data.message));
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const deleteMessageRecord = (ID) => async (dispatch) => {
  return API.del(
    Gateway.name,
    `/messages/delete-message/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      dispatch(showNotification("success", "Message Deleted", "Message was successfully deleted."));
      dispatch({ type: DELETE_MESSAGE, payload: ID });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) dispatch(showNotification("error", "Could not delete your message.", error.response.data.message));
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const deleteMessages = (message_ids) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/messages/delete-messages/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        message_ids
      }
    }).then((data) => {
      if (data.payload.failed) dispatch(showNotification("error", "Delete Failed", `Could not delete ${data.payload.failed.length} of ${message_ids.length} ${message_ids.length === 1 ? "message" : "messages"}.`));
      else dispatch(showNotification("success", "Records Deleted", `Successfully deleted ${data.payload.success.length} of ${message_ids.length} ${message_ids.length === 1 ? "message" : "messages"}.`));
      dispatch({ type: DELETE_MESSAGES, payload: data.payload.success });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};