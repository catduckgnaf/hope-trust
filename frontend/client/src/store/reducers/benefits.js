import {
  GET_ACCOUNT_BENEFITS,
  CREATE_BENEFIT_RECORD,
  UPDATE_BENEFIT_RECORD,
  DELETE_BENEFIT_RECORD,
  OPEN_CREATE_BENEFIT_MODAL,
  CLOSE_CREATE_BENEFIT_MODAL,
  IS_FETCHING_BENEFITS,
  HAS_REQUESTED_BENEFITS,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";
import { isEqual } from "lodash";

const defaultState = {
  government_benefits: [],
  creating_benefit: false,
  defaults: {},
  updating: false,
  viewing: false,
  total_benefits: 0,
  requested: false,
  isFetching: false,
  simulation: false
};

const benefitsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACCOUNT_BENEFITS:
      let totalBenefits = 0;
      const incoming_government_benefits = payload;
      if (!isEqual(incoming_government_benefits, state.government_benefits)) {
        let benefits = {};
        incoming_government_benefits.forEach((record) => totalBenefits += record.value);
        benefits.government_benefits = incoming_government_benefits;
        benefits.total_benefits = totalBenefits;
        benefits.requested = true;
        benefits.isFetching = false;
        return { ...state, ...benefits };
      } else {
        return { ...state, isFetching: false, requested: true  };
      }
    case CREATE_BENEFIT_RECORD:
      let all_benefit_records = state.government_benefits;
      all_benefit_records.push(payload.data);
      let all_benefits = {};
      let totalNewBenefits = 0;
      all_benefit_records.forEach((record) => totalNewBenefits += record.value);
      all_benefits.total_benefits = totalNewBenefits;
      all_benefits.government_benefits = all_benefit_records;
      return { ...state, ...all_benefits };
    case UPDATE_BENEFIT_RECORD:
      let all_previous_benefit_records = state.government_benefits.filter((a) => a.id !== payload.ID);
      all_previous_benefit_records.push(payload.data);
      let totalUpdatedBenefits = 0;
      let new_benefits_config = {};
      all_previous_benefit_records.forEach((record) => totalUpdatedBenefits += record.value);
      new_benefits_config.government_benefits = all_previous_benefit_records;
      new_benefits_config.total_benefits = totalUpdatedBenefits;
      return { ...state, ...new_benefits_config };
    case DELETE_BENEFIT_RECORD:
      let all_preserved_benefit_records = state.government_benefits.filter((a) => a.id !== payload);
      let totalPreservedBenefits = 0;
      let preserved_benefits_config = {};
      all_preserved_benefit_records.forEach((record) => totalPreservedBenefits += record.value);
      preserved_benefits_config.government_benefits = all_preserved_benefit_records;
      preserved_benefits_config.total_benefits = totalPreservedBenefits;
      return { ...state, ...preserved_benefits_config };
    case OPEN_CREATE_BENEFIT_MODAL:
      let open_benefits_config = {};
      open_benefits_config.creating_benefit = true;
      open_benefits_config.type = payload.type;
      open_benefits_config.defaults = payload.defaults;
      open_benefits_config.updating = payload.updating;
      open_benefits_config.viewing = payload.viewing;
      open_benefits_config.simulation = payload.simulation;
      return { ...state, ...open_benefits_config };
    case CLOSE_CREATE_BENEFIT_MODAL:
      let close_benefit_config = {};
      close_benefit_config.creating_benefit = false;
      close_benefit_config.type = "";
      close_benefit_config.defaults = {};
      close_benefit_config.updating = false;
      close_benefit_config.viewing = false;
      close_benefit_config.simulation = false;
      return { ...state, ...close_benefit_config };
    case IS_FETCHING_BENEFITS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_BENEFITS:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return { ...defaultState, government_benefits: [] };
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default benefitsReducer;
