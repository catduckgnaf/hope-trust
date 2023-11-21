import {
  GET_MEDICATIONS,
  OPEN_MEDICATIONS_MODAL,
  CLOSE_MEDICATIONS_MODAL,
  ADD_MEDICATION,
  DELETE_MEDICATION,
  EDIT_MEDICATION,
  IS_FETCHING_MEDICATIONS,
  HAS_REQUESTED_MEDICATIONS
} from "../actions/constants";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { logEvent } from "./utilities";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getMedications = (override = false) => async (dispatch) => {
  if ((!store.getState().medication.isFetching && !store.getState().medication.requested) || override) {
    dispatch({ type: IS_FETCHING_MEDICATIONS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/medications/get-medications/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        }
      });
      if (data.success) {
        dispatch({ type: GET_MEDICATIONS, payload: data.payload });
        dispatch({ type: IS_FETCHING_MEDICATIONS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_MEDICATIONS, payload: true });
        dispatch({ type: IS_FETCHING_MEDICATIONS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_MEDICATIONS, payload: true });
      dispatch({ type: IS_FETCHING_MEDICATIONS, payload: false });
    }
  }
};

export const searchMedications = (query) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/medications/search/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        query
      }
    }).then((data) => {
      if (data.success) {
        return data.payload;
      }
      return { success: false };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const createMedication = (newMedication) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/medications/create-single-medication/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        newMedication
      }
    }).then((data) => {
      dispatch({ type: ADD_MEDICATION, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};

export const updateMedication = (ID, updatedMedication) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/medications/update-single-medication/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates: updatedMedication
      }
    }).then((data) => {
      dispatch({ type: EDIT_MEDICATION, payload: data.payload });
      return { success: true };
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};
export const deleteMedication = (ID) => async (dispatch) => {
  dispatch({ type: DELETE_MEDICATION, payload: ID });
  return API.del(
    Gateway.name,
    `/medications/delete-single-medication/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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


export const openCreateMedicationModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_MEDICATIONS_MODAL, payload: { defaults, updating, viewing, current_page }});
  dispatch(logEvent("medication", store.getState().user, "modal"));
};

export const closeCreateMedicationModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_MEDICATIONS_MODAL });
};

export const medication_frequencies = [
  { value: "as needed", label: "As Needed" },
  { value: "daily/multiple times per day", label: "Daily/Multiple Times Per Day" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];

export const times_of_day = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "as needed", label: "As Needed" }
];

export const times_per_day = [
  { value: 1, label: "1 time" },
  { value: 2, label: "2 times" },
  { value: 3, label: "3 times" },
  { value: 4, label: "4 times" },
  { value: 5, label: "5 times" },
  { value: 6, label: "6 times" },
  { value: 7, label: "7 times" },
  { value: 8, label: "8 times" },
  { value: 9, label: "9 times" },
  { value: 10, label: "10 times" }
];

export const side_effects_defaults = [
  { value: "Constipation", label: "Constipation" },
  { value: "Skin Rash or Dermatitis", label: "Skin Rash or Dermatitis" },
  { value: "Diarrhea", label: "Diarrhea" },
  { value: "Dizziness", label: "Dizziness" },
  { value: "Drowsiness", label: "Drowsiness" },
  { value: "Dry mouth", label: "Dry mouth" },
  { value: "Headache", label: "Headache" },
  { value: "Insomnia", label: "Insomnia" },
  { value: "Nausea", label: "Nausea" },
  { value: "Suicidal Thoughts", label: "Suicidal Thoughts" },
  { value: "Abnormal Heart Rhythms", label: "Abnormal Heart Rhythms" },
  { value: "Internal Bleeding", label: "Internal Bleeding" },
  { value: "Cancer", label: "Cancer" },
  { value: "Fever", label: "Fever" },
  { value: "Fatigue", label: "Fatigue" },
  { value: "Swelling", label: "Swelling" },
  { value: "Loss of Appetite", label: "Loss of Appetite" },
  { value: "Alopecia", label: "Alopecia" },
  { value: "Hearing Impairment", label: "Hearing Impairment" },
  { value: "Moodiness", label: "Moodiness" },
  { value: "Reduced Libido", label: "Reduced Libido" },
  { value: "Cognitive Problems", label: "Cognitive Problems" },
];

export const default_routes = [
  { value: "Oral", label: "Oral" },
  { value: "Injection", label: "Injection" },
  { value: "Sublingual", label: "Sublingual" },
  { value: "Buccal", label: "Buccal" },
  { value: "Rectal", label: "Rectal" },
  { value: "Vaginal", label: "Vaginal" },
  { value: "Ocular", label: "Ocular" },
  { value: "Nasal", label: "Nasal" },
  { value: "Nebulization", label: "Nebulization" },
  { value: "Cutaneous", label: "Cutaneous" },
  { value: "Transdermal", label: "Transdermal" },
  { value: "Inhalation", label: "Inhalation" }
];

export const default_strengths = [
  { value: 1, label: 1 },
  { value: 10, label: 10 },
  { value: 25, label: 25 },
  { value: 50, label: 50 },
  { value: 100, label: 100 },
  { value: 250, label: 250 },
  { value: 500, label: 500 },
  { value: 750, label: 750 },
  { value: 1000, label: 1000 }
];

export const default_units = [
  { value: "kg", label: "kg" },
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "mL", label: "mL" }
];

export const default_dosage_forms = [
  { value: "Tablet", label: "Tablet" },
  { value: "Capsule", label: "Capsule" },
  { value: "Oral Suspension", label: "Oral Suspension" },
  { value: "Oral Solution", label: "Oral Solution" },
  { value: "Syrup", label: "Syrup" },
  { value: "Tincture", label: "Tincture" },
  { value: "Powder", label: "Powder" },
  { value: "Lozenge", label: "Lozenge" },
  { value: "Suppositorie", label: "Suppositorie" },
  { value: "Transdermal Patch", label: "Transdermal Patch" },
  { value: "Inhaler", label: "Inhaler" },
  { value: "Intravenous", label: "Intravenous" },
  { value: "Subcutaneous", label: "Subcutaneous" },
  { value: "Intramuscular", label: "Intramuscular" }
];