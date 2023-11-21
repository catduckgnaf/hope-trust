import {
  GET_CE_CONFIGS,
  ADD_CE_CONFIG,
  DELETE_CE_CONFIG,
  DELETE_CE_CONFIGS,
  EDIT_CE_CONFIG,
  IS_FETCHING_CE_CONFIGS,
  HAS_REQUESTED_CE_CONFIGS,
  OPEN_CE_CONFIG_MODAL,
  CLOSE_CE_CONFIG_MODAL,
  OPEN_CE_CREDIT_MODAL,
  CLOSE_CE_CREDIT_MODAL,
  IS_FETCHING_CE_CREDITS,
  GET_CE_CREDITS,
  HAS_REQUESTED_CE_CREDITS,
  CHANGE_CE_TAB,
  ADD_CE_COURSE,
  DELETE_CE_COURSE,
  DELETE_CE_COURSES,
  IS_FETCHING_CE_COURSES,
  GET_CE_COURSES,
  HAS_REQUESTED_CE_COURSES,
  OPEN_CE_COURSE_MODAL,
  CLOSE_CE_COURSE_MODAL
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { showNotification } from "./notification";
import { store } from "..";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const getCEConfigs = (override = false) => async (dispatch) => {
  if ((!store.getState().ce_management.isFetching && !store.getState().ce_management.requested) || override) {
    dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/ce/get-ce-configs/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_CE_CONFIGS, payload: data.payload });
        dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_CE_CONFIGS, payload: true });
        dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_CE_CONFIGS, payload: [] });
      dispatch({ type: HAS_REQUESTED_CE_CONFIGS, payload: true });
      dispatch({ type: IS_FETCHING_CE_CONFIGS, payload: false });
      return { success: false };
    }
  }
};
export const getCECredits = (override = false) => async (dispatch) => {
  if ((!store.getState().ce_management.isFetchingCredits && !store.getState().ce_management.requestedCredits) || override) {
    dispatch({ type: IS_FETCHING_CE_CREDITS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/ce/get-ce-credits/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_CE_CREDITS, payload: data.payload });
        dispatch({ type: IS_FETCHING_CE_CREDITS, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_CE_CREDITS, payload: true });
        dispatch({ type: IS_FETCHING_CE_CREDITS, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_CE_CREDITS, payload: [] });
      dispatch({ type: HAS_REQUESTED_CE_CREDITS, payload: true });
      dispatch({ type: IS_FETCHING_CE_CREDITS, payload: false });
      return { success: false };
    }
  }
};
export const getCECourses = (override = false) => async (dispatch) => {
  if ((!store.getState().ce_management.isFetchingCourses && !store.getState().ce_management.requestedCourses) || override) {
    dispatch({ type: IS_FETCHING_CE_COURSES, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/ce/get-ce-courses/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_CE_COURSES, payload: data.payload });
        dispatch({ type: IS_FETCHING_CE_COURSES, payload: false });
      } else {
        dispatch({ type: HAS_REQUESTED_CE_COURSES, payload: true });
        dispatch({ type: IS_FETCHING_CE_COURSES, payload: false });
      }
      return data;
    } catch (error) {
      dispatch({ type: GET_CE_COURSES, payload: [] });
      dispatch({ type: HAS_REQUESTED_CE_COURSES, payload: true });
      dispatch({ type: IS_FETCHING_CE_COURSES, payload: false });
      return { success: false };
    }
  }
};
export const createCEConfig = (newCEConfig) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/ce/create-ce-config/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newCEConfig
      }
    }).then((data) => {
      dispatch({ type: ADD_CE_CONFIG, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const updateCEConfig = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/ce/update-ce-config/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: EDIT_CE_CONFIG, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const updateCEQuiz = (id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/ce/update-ce-quiz/${id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch(getCECredits(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteCEConfig = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_CE_CONFIG, payload: ID });
  return API.del(
    Gateway.name,
    `/ce/delete-ce-config/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const deleteCEConfigs = (config_ids) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/ce/delete-ce-configs/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        config_ids
      }
    }).then((data) => {
      if (data.payload.failed) dispatch(showNotification("error", "Delete Failed", `Could not delete ${data.payload.failed.length} of ${config_ids.length} ${config_ids.length === 1 ? "config" : "configs"}.`));
      else dispatch(showNotification("success", "Records Deleted", `Successfully deleted ${data.payload.success.length} of ${config_ids.length} ${config_ids.length === 1 ? "config" : "configs"}.`));
      dispatch({ type: DELETE_CE_CONFIGS, payload: data.payload.success });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const createCECourse = (newCECourse) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/ce/create-ce-course/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newCECourse
      }
    }).then((data) => {
      dispatch({ type: ADD_CE_COURSE, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const updateCECourse = (id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/ce/update-ce-course/${id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch(getCECourses(true));
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};
export const deleteCECourse = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_CE_COURSE, payload: ID });
  return API.del(
    Gateway.name,
    `/ce/delete-ce-course/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const deleteCECourses = (course_ids) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/ce/delete-ce-courses/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        course_ids
      }
    }).then((data) => {
      if (data.payload.failed) dispatch(showNotification("error", "Delete Failed", `Could not delete ${data.payload.failed.length} of ${course_ids.length} ${course_ids.length === 1 ? "course" : "courses"}.`));
      else dispatch(showNotification("success", "Records Deleted", `Successfully deleted ${data.payload.success.length} of ${course_ids.length} ${course_ids.length === 1 ? "course" : "courses"}.`));
      dispatch({ type: DELETE_CE_COURSES, payload: data.payload.success });
      return data;
    }).catch((error) => {
      if (error && error.response) return error.response.data;
      return { success: false };
    });
};

export const openCeCourseModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_CE_COURSE_MODAL, payload: { defaults, updating, viewing } });
};

export const closeCeCourseModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CE_COURSE_MODAL });
};

export const openCeConfigModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_CE_CONFIG_MODAL, payload: { defaults, updating, viewing }});
};

export const closeCeConfigModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CE_CONFIG_MODAL });
};

export const openCECreditModal = (defaults, updating, viewing) => async (dispatch) => {
  dispatch({ type: OPEN_CE_CREDIT_MODAL, payload: { defaults, updating, viewing }});
};

export const closeCECreditModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CE_CREDIT_MODAL });
};

export const changeCETab = (tab) => async (dispatch) => {
  dispatch({ type: CHANGE_CE_TAB, payload: tab });
};