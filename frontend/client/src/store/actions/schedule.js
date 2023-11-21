import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
import {
  GET_SCHEDULE_EVENTS,
  OPEN_SCHEDULE_MODAL,
  CLOSE_SCHEDULE_MODAL,
  ADD_EVENT,
  ADD_EVENTS,
  DELETE_EVENT,
  DELETE_EVENTS,
  EDIT_EVENT,
  EDIT_EVENTS,
  HAS_REQUESTED_EVENTS,
  IS_FETCHING_EVENTS
} from "../actions/constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getEvents = (override = false) => async (dispatch) => {
  if ((!store.getState().schedule.isFetching && !store.getState().schedule.requested) || override) {
    dispatch({ type: IS_FETCHING_EVENTS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/events/get-events/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_SCHEDULE_EVENTS, payload: data.payload });
        dispatch({ type: IS_FETCHING_EVENTS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_EVENTS, payload: true });
        dispatch({ type: IS_FETCHING_EVENTS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_EVENTS, payload: true });
      dispatch({ type: IS_FETCHING_EVENTS, payload: false });
    }
  }
};

export const createEvent = (newEvent) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/events/create-single-event/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newEvent
      }
    }).then((data) => {
      dispatch({ type: ADD_EVENT, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const createBulkEvents = (newEvent) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/events/create-bulk-events/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newEvent
      }
    }).then((data) => {
      dispatch({ type: ADD_EVENTS, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateEvent = (ID, updatedEvent) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/events/update-single-event/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedEvent
      }
    }).then((data) => {
      dispatch({ type: EDIT_EVENT, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateBulkEvents = (ID, updatedEvent) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/events/update-bulk-events/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedEvent
      }
    }).then((data) => {
      dispatch({ type: EDIT_EVENTS, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteBulkEvents = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_EVENTS, payload: ID });
  return API.del(
    Gateway.name,
    `/events/delete-bulk-events/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteEvent = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_EVENT, payload: ID });
  return API.del(
    Gateway.name,
    `/events/delete-single-event/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const openCreateEventModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_SCHEDULE_MODAL, payload: { defaults, updating, viewing } });
  dispatch(logEvent("event", store.getState().user, "modal"));
};

export const closeCreateEventModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_SCHEDULE_MODAL });
};

export const event_titles = [
  "Wake up",
  "Morning Hygiene",
  "Breakfast",
  "Lunch",
  "Snack",
  "Dinner",
  "Evening Hygiene",
  "Sleep"
];

export const event_types = [
  { value: "weekly", label: "Weekly" },
  { value: "non-weekly", label: "Non-Weekly" }
];

export const event_frequency = [
  { value: "bi-weekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "bi-monthly", label: "Bi-Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "bi-annually", label: "Bi-Annually" },
  { value: "other", label: "Other" }
];

export const event_durations = [
  { value: "10 minutes", label: "10 minutes" },
  { value: "15 minutes", label: "15 minutes" },
  { value: "20 minutes", label: "20 minutes" },
  { value: "25 minutes", label: "25 minutes" },
  { value: "30 minutes", label: "30 minutes" },
  { value: "35 minutes", label: "35 minutes" },
  { value: "40 minutes", label: "40 minutes" },
  { value: "45 minutes", label: "45 minutes" },
  { value: "50 minutes", label: "50 minutes" },
  { value: "55 minutes", label: "55 minutes" },
  { value: "1 hour", label: "1 hour" },
  { value: "2 hours", label: "2 hours" },
  { value: "3 hours", label: "3 hours" },
  { value: "4 hours", label: "4 hours" },
  { value: "5 hours", label: "5 hours" },
  { value: "5+ hours", label: "5+ hours" }
];

export const times = [
  { value: "12:00 AM", label: "12:00 AM", category: "morning" },
  { value: "12:15 AM", label: "12:15 AM", category: "morning" },
  { value: "12:30 AM", label: "12:30 AM", category: "morning" },
  { value: "12:45 AM", label: "12:45 AM", category: "morning" },
  { value: "1:00 AM", label: "1:00 AM", category: "morning" },
  { value: "1:15 AM", label: "1:15 AM", category: "morning" },
  { value: "1:30 AM", label: "1:30 AM", category: "morning" },
  { value: "1:45 AM", label: "1:45 AM", category: "morning" },
  { value: "2:00 AM", label: "2:00 AM", category: "morning" },
  { value: "2:15 AM", label: "2:15 AM", category: "morning" },
  { value: "2:30 AM", label: "2:30 AM", category: "morning" },
  { value: "2:45 AM", label: "2:45 AM", category: "morning" },
  { value: "3:00 AM", label: "3:00 AM", category: "morning" },
  { value: "3:15 AM", label: "3:15 AM", category: "morning" },
  { value: "3:30 AM", label: "3:30 AM", category: "morning" },
  { value: "3:45 AM", label: "3:45 AM", category: "morning" },
  { value: "4:00 AM", label: "4:00 AM", category: "morning" },
  { value: "4:15 AM", label: "4:15 AM", category: "morning" },
  { value: "4:30 AM", label: "4:30 AM", category: "morning" },
  { value: "4:45 AM", label: "4:45 AM", category: "morning" },
  { value: "5:00 AM", label: "5:00 AM", category: "morning" },
  { value: "5:15 AM", label: "5:15 AM", category: "morning" },
  { value: "5:30 AM", label: "5:30 AM", category: "morning" },
  { value: "5:45 AM", label: "5:45 AM", category: "morning" },
  { value: "6:00 AM", label: "6:00 AM", category: "morning" },
  { value: "6:15 AM", label: "6:15 AM", category: "morning" },
  { value: "6:30 AM", label: "6:30 AM", category: "morning" },
  { value: "6:45 AM", label: "6:45 AM", category: "morning" },
  { value: "7:00 AM", label: "7:00 AM", category: "morning" },
  { value: "7:15 AM", label: "7:15 AM", category: "morning" },
  { value: "7:30 AM", label: "7:30 AM", category: "morning" },
  { value: "7:45 AM", label: "7:45 AM", category: "morning" },
  { value: "8:00 AM", label: "8:00 AM", category: "morning" },
  { value: "8:15 AM", label: "8:15 AM", category: "morning" },
  { value: "8:30 AM", label: "8:30 AM", category: "morning" },
  { value: "8:45 AM", label: "8:45 AM", category: "morning" },
  { value: "9:00 AM", label: "9:00 AM", category: "morning" },
  { value: "9:15 AM", label: "9:15 AM", category: "morning" },
  { value: "9:30 AM", label: "9:30 AM", category: "morning" },
  { value: "9:45 AM", label: "9:45 AM", category: "morning" },
  { value: "10:00 AM", label: "10:00 AM", category: "morning" },
  { value: "10:15 AM", label: "10:15 AM", category: "morning" },
  { value: "10:30 AM", label: "10:30 AM", category: "morning" },
  { value: "10:45 AM", label: "10:45 AM", category: "morning" },
  { value: "11:00 AM", label: "11:00 AM", category: "morning" },
  { value: "11:15 AM", label: "11:15 AM", category: "morning" },
  { value: "11:30 AM", label: "11:30 AM", category: "morning" },
  { value: "11:45 AM", label: "11:45 AM", category: "morning" },
  { value: "12:00 PM", label: "12:00 PM", category: "afternoon" },
  { value: "12:15 PM", label: "12:15 PM", category: "afternoon" },
  { value: "12:30 PM", label: "12:30 PM", category: "afternoon" },
  { value: "12:45 PM", label: "12:45 PM", category: "afternoon" },
  { value: "1:00 PM", label: "1:00 PM", category: "afternoon" },
  { value: "1:15 PM", label: "1:15 PM", category: "afternoon" },
  { value: "1:30 PM", label: "1:30 PM", category: "afternoon" },
  { value: "1:45 PM", label: "1:45 PM", category: "afternoon" },
  { value: "2:00 PM", label: "2:00 PM", category: "afternoon" },
  { value: "2:15 PM", label: "2:15 PM", category: "afternoon" },
  { value: "2:30 PM", label: "2:30 PM", category: "afternoon" },
  { value: "2:45 PM", label: "2:45 PM", category: "afternoon" },
  { value: "3:00 PM", label: "3:00 PM", category: "afternoon" },
  { value: "3:15 PM", label: "3:15 PM", category: "afternoon" },
  { value: "3:30 PM", label: "3:30 PM", category: "afternoon" },
  { value: "3:45 PM", label: "3:45 PM", category: "afternoon" },
  { value: "4:00 PM", label: "4:00 PM", category: "afternoon" },
  { value: "4:15 PM", label: "4:15 PM", category: "afternoon" },
  { value: "4:30 PM", label: "4:30 PM", category: "afternoon" },
  { value: "4:45 PM", label: "4:45 PM", category: "afternoon" },
  { value: "5:00 PM", label: "5:00 PM", category: "afternoon" },
  { value: "5:15 PM", label: "5:15 PM", category: "afternoon" },
  { value: "5:30 PM", label: "5:30 PM", category: "afternoon" },
  { value: "5:45 PM", label: "5:45 PM", category: "afternoon" },
  { value: "6:00 PM", label: "6:00 PM", category: "afternoon" },
  { value: "6:15 PM", label: "6:15 PM", category: "afternoon" },
  { value: "6:30 PM", label: "6:30 PM", category: "afternoon" },
  { value: "6:45 PM", label: "6:45 PM", category: "afternoon" },
  { value: "7:00 PM", label: "7:00 PM", category: "afternoon" },
  { value: "7:15 PM", label: "7:15 PM", category: "afternoon" },
  { value: "7:30 PM", label: "7:30 PM", category: "afternoon" },
  { value: "7:45 PM", label: "7:45 PM", category: "afternoon" },
  { value: "8:00 PM", label: "8:00 PM", category: "afternoon" },
  { value: "8:15 PM", label: "8:15 PM", category: "afternoon" },
  { value: "8:30 PM", label: "8:30 PM", category: "afternoon" },
  { value: "8:45 PM", label: "8:45 PM", category: "afternoon" },
  { value: "9:00 PM", label: "9:00 PM", category: "afternoon" },
  { value: "9:15 PM", label: "9:15 PM", category: "afternoon" },
  { value: "9:30 PM", label: "9:30 PM", category: "afternoon" },
  { value: "9:45 PM", label: "9:45 PM", category: "afternoon" },
  { value: "10:00 PM", label: "10:00 PM", category: "afternoon" },
  { value: "10:15 PM", label: "10:15 PM", category: "afternoon" },
  { value: "10:30 PM", label: "10:30 PM", category: "afternoon" },
  { value: "10:45 PM", label: "10:45 PM", category: "afternoon" },
  { value: "11:00 PM", label: "11:00 PM", category: "afternoon" },
  { value: "11:15 PM", label: "11:15 PM", category: "afternoon" },
  { value: "11:30 PM", label: "11:30 PM", category: "afternoon" },
  { value: "11:45 PM", label: "11:45 PM", category: "afternoon" }
];

export const week_day_colors = {
  "sunday": {
    "color": "#ef6e3c"
  },
  "monday": {
    "color": "#be608b"
  },
  tuesday: {
    "color": "#e33e52"
  },
  "wednesday": {
    "color": "#4bb473"
  },
  "thursday": {
    "color": "#2f3f94"
  },
  "friday": {
    "color": "#2f7b99"
  },
  "saturday": {
    "color": "#4ca2f9"
  }
};