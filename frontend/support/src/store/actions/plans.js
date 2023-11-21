import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import {
  GET_USER_PLANS,
  GET_PARTNER_PLANS,
  GET_ACTIVE_USER_PLANS,
  GET_ACTIVE_PARTNER_PLANS,
  IS_FETCHING_ACTIVE_USER_PLANS,
  IS_FETCHING_ACTIVE_PARTNER_PLANS,
  IS_FETCHING_USER_PLANS,
  IS_FETCHING_PARTNER_PLANS,
  HAS_REQUESTED_USER_PLANS,
  HAS_REQUESTED_PARTNER_PLANS,
  HAS_REQUESTED_ACTIVE_USER_PLANS,
  HAS_REQUESTED_ACTIVE_PARTNER_PLANS,
  CREATE_USER_PLAN,
  CREATE_PARTNER_PLAN,
  UPDATE_USER_PLAN,
  UPDATE_PARTNER_PLAN,
  DELETE_USER_PLAN,
  DELETE_PARTNER_PLAN,
  OPEN_CREATE_USER_PLAN_MODAL,
  OPEN_CREATE_PARTNER_PLAN_MODAL,
  CLOSE_CREATE_USER_PLAN_MODAL,
  CLOSE_CREATE_PARTNER_PLAN_MODAL
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const all_permissions = [
  { label: "Basic User", value: "basic-user" },
  { label: "Account Admin View", value: "account-admin-view" },
  { label: "Account Admin Edit", value: "account-admin-edit" },
  { label: "Finance View", value: "finance-view" },
  { label: "Finance Edit", value: "finance-edit" },
  { label: "Health & Life View", value: "health-and-life-view" },
  { label: "Health & Life Edit", value: "health-and-life-edit" },
  { label: "Grantor Assets View", value: "grantor-assets-view" },
  { label: "Grantor Assets Edit", value: "grantor-assets-edit" },
  { label: "Budget View", value: "budget-view" },
  { label: "Budget Edit", value: "budget-edit" },
  { label: "MYTO View", value: "myto-view" },
  { label: "MYTO Edit", value: "myto-edit" },
  { label: "Request HCC View", value: "request-hcc-view" },
  { label: "Request HCC Edit", value: "request-hcc-edit" }
];

export const all_permissions_array = [
  "account-admin-view",
  "account-admin-edit",
  "finance-view",
  "finance-edit",
  "health-and-life-view",
  "ealth-and-life-edit",
  "grantor-assets-view",
  "grantor-assets-edit",
  "budget-view",
  "budget-edit",
  "myto-view",
  "myto-edit",
  "request-hcc-view",
  "request-hcc-edit"
];

export const getUserPlans = (override = false) => async (dispatch) => {
  if ((!store.getState().plans.isFetchingUserPlans && !store.getState().plans.requestedUserPlans) || override) {
    dispatch({ type: IS_FETCHING_USER_PLANS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/plans/get-user-plans/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_USER_PLANS, payload: data.payload });
        dispatch({ type: IS_FETCHING_USER_PLANS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_USER_PLANS, payload: true });
        dispatch({ type: IS_FETCHING_USER_PLANS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_USER_PLANS, payload: true });
      dispatch({ type: IS_FETCHING_USER_PLANS, payload: false });
    }
  }
};

export const getPartnerPlans = (override = false) => async (dispatch) => {
  if ((!store.getState().plans.isFetchingPartnerPlans && !store.getState().plans.requestedPartnerPlans) || override) {
    dispatch({ type: IS_FETCHING_PARTNER_PLANS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/plans/get-partner-plans/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_PARTNER_PLANS, payload: data.payload });
        dispatch({ type: IS_FETCHING_PARTNER_PLANS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_PARTNER_PLANS, payload: true });
        dispatch({ type: IS_FETCHING_PARTNER_PLANS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_PARTNER_PLANS, payload: true });
      dispatch({ type: IS_FETCHING_PARTNER_PLANS, payload: false });
    }
  }
};

export const getActiveUserPlans = (override = false) => async (dispatch) => {
  if ((!store.getState().plans.isFetchingActiveUserPlans && !store.getState().plans.requestedActiveUserPlans) || override) {
    dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/plans/get-active-user-plans/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACTIVE_USER_PLANS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_ACTIVE_USER_PLANS, payload: true });
        dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_ACTIVE_USER_PLANS, payload: true });
      dispatch({ type: IS_FETCHING_ACTIVE_USER_PLANS, payload: false });
    }
  }
};

export const getActivePartnerPlans = (type, override = false) => async (dispatch) => {
  if ((!store.getState().plans.isFetchingActivePartnerPlans && !store.getState().plans.requestedActivePartnerPlans) || override) {
    dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/plans/get-active-partner-plans/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          },
          queryStringParameters: {
            type
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACTIVE_PARTNER_PLANS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: false });
        return data.success;
      } else {
        dispatch({ type: HAS_REQUESTED_ACTIVE_PARTNER_PLANS, payload: true });
        dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_ACTIVE_PARTNER_PLANS, payload: true });
      dispatch({ type: IS_FETCHING_ACTIVE_PARTNER_PLANS, payload: false });
    }
  }
};

export const createUserPlan = (plan) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/plans/create-user-plan/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        plan
      }
    }).then((data) => {
      dispatch({ type: CREATE_USER_PLAN, payload: { data: data.payload } });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const createPartnerPlan = (plan) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/plans/create-partner-plan/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        plan
      }
    }).then((data) => {
      dispatch({ type: CREATE_PARTNER_PLAN, payload: { data: data.payload } });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateUserPlan = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/plans/update-user-plan/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: UPDATE_USER_PLAN, payload: { ID, data: data.payload } });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updatePartnerPlan = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/plans/update-partner-plan/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: UPDATE_PARTNER_PLAN, payload: { ID, data: data.payload } });
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deleteUserPlan = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_USER_PLAN, payload: ID });
  return API.del(
    Gateway.name,
    `/plans/delete-user-plan/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const deletePartnerPlan = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_PARTNER_PLAN, payload: ID });
  return API.del(
    Gateway.name,
    `/plans/delete-partner-plan/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const openCreateUserPlanModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_USER_PLAN_MODAL, payload: { defaults, updating, viewing, current_page } });
};

export const openCreatePartnerPlanModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_PARTNER_PLAN_MODAL, payload: { defaults, updating, viewing, current_page } });
};

export const closeCreateUserPlanModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_USER_PLAN_MODAL });
};

export const closeCreatePartnerPlanModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_PARTNER_PLAN_MODAL });
};