import {
  GET_ACCOUNT_INCOME,
  CREATE_INCOME_RECORD,
  UPDATE_INCOME_RECORD,
  DELETE_INCOME_RECORD,
  OPEN_CREATE_INCOME_MODAL,
  CLOSE_CREATE_INCOME_MODAL,
  IS_FETCHING_INCOME,
  HAS_REQUESTED_INCOME,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";
import { isEqual } from "lodash";

const defaultState = {
  income_sources: [],
  creating_income: false,
  defaults: {},
  updating: false,
  viewing: false,
  total_income: 0,
  requested: false,
  isFetching: false,
  simulation: false
};

const incomeReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACCOUNT_INCOME:
      let totalIncome = 0;
      const incoming_income_sources = payload;
      if (!isEqual(incoming_income_sources, state.income_sources)) {
        let income = {};
        incoming_income_sources.forEach((record) => totalIncome += record.monthly_income);
        income.income_sources = incoming_income_sources;
        income.total_income = totalIncome;
        income.requested = true;
        income.isFetching = false;
        return { ...state, ...income };
      } else {
        return { ...state, isFetching: false, requested: true  };
      }
    case CREATE_INCOME_RECORD:
      let all_income_records = state.income_sources;
      all_income_records.push(payload.data);
      let all_income = {};
      let totalNewIncome = 0;
      all_income_records.forEach((record) => totalNewIncome += record.monthly_income);
      all_income.total_income = totalNewIncome;
      all_income.income_sources = all_income_records;
      return { ...state, ...all_income };
    case UPDATE_INCOME_RECORD:
      let all_previous_income_records = state.income_sources.filter((a) => a.id !== payload.ID);
      all_previous_income_records.push(payload.data);
      let totalUpdatedIncome = 0;
      let new_income_config = {};
      all_previous_income_records.forEach((record) => totalUpdatedIncome += record.monthly_income);
      new_income_config.income_sources = all_previous_income_records;
      new_income_config.total_income = totalUpdatedIncome;
      return { ...state, ...new_income_config };
    case DELETE_INCOME_RECORD:
      let all_preserved_income_records = state.income_sources.filter((a) => a.id !== payload);
      let totalPreservedIncome = 0;
      let preserved_income_config = {};
      all_preserved_income_records.forEach((record) => totalPreservedIncome += record.monthly_income);
      preserved_income_config.income_sources = all_preserved_income_records;
      preserved_income_config.total_income = totalPreservedIncome;
      return { ...state, ...preserved_income_config };
    case OPEN_CREATE_INCOME_MODAL:
      let open_income_config = {};
      open_income_config.creating_income = true;
      open_income_config.type = payload.type;
      open_income_config.defaults = payload.defaults;
      open_income_config.updating = payload.updating;
      open_income_config.viewing = payload.viewing;
      open_income_config.simulation = payload.simulation;
      return { ...state, ...open_income_config };
    case CLOSE_CREATE_INCOME_MODAL:
      let close_income_config = {};
      close_income_config.creating_income = false;
      close_income_config.type = "";
      close_income_config.defaults = {};
      close_income_config.updating = false;
      close_income_config.viewing = false;
      close_income_config.simulation = false;
      return { ...state, ...close_income_config };
    case IS_FETCHING_INCOME:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_INCOME:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return { ...defaultState, income_sources: [] };
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default incomeReducer;
