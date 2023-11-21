import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import { showNotification } from "./notification";
import { GET_MESSAGES, UPDATE_MESSAGE, IS_FETCHING_MESSAGES, HAS_REQUESTED_MESSAGES, NEW_MESSAGE, OPEN_MESSAGE, SEND_MESSAGE, CLOSE_MESSAGE } from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getMessages = (override) => async (dispatch) => {
  if (!store.getState().session.idle && ((!store.getState().message.isFetching && !store.getState().message.requested) || override)) {
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
        if ((data.payload.length > store.getState().message.list.length) && store.getState().message.requested) {
          const new_messages = data.payload.length - store.getState().message.list.length;
          dispatch(showNotification("info", new_messages === 1 ? "New Message" : "New Messages", `You have ${new_messages} new ${new_messages === 1 ? "message" : "messages"}.`));
        }
        dispatch({ type: GET_MESSAGES, payload: data.payload });
        dispatch({ type: IS_FETCHING_MESSAGES, paoad: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_MESSAGES, payload: true });
        dispatch({ type: IS_FETCHING_MESSAGES, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: GET_MESSAGES, payload: [] });
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
  dispatch(logEvent("new-message", store.getState().user, "modal"));
};

export const openMessage = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_MESSAGE, payload: { defaults, updating, viewing } });
  dispatch(logEvent("view-message", store.getState().user, "modal"));
};

export const closeMessage = () => async (dispatch) => {
  dispatch({ type: CLOSE_MESSAGE });
};

export const sendMessage = (config, user, url_parameters, type) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/messages/send-message/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newMessage: config,
        user,
        url_parameters,
        type
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
