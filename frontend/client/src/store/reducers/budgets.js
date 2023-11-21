import {
  GET_ACCOUNT_BUDGETS,
  CREATE_BUDGET_RECORD,
  UPDATE_BUDGET_RECORD,
  DELETE_BUDGET_RECORD,
  OPEN_CREATE_BUDGET_MODAL,
  CLOSE_CREATE_BUDGET_MODAL,
  IS_FETCHING_BUDGETS,
  HAS_REQUESTED_BUDGETS,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";
import { isEqual } from "lodash";

const defaultState = {
  budget_items: [],
  creating_budget: false,
  defaults: {},
  updating: false,
  viewing: false,
  total_budget: 0,
  requested: false,
  isFetching: false,
  simulation: false
};

const budgetsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACCOUNT_BUDGETS:
      let totalBudget = 0;
      const incoming_budgets = payload;
      if (!isEqual(incoming_budgets, state.budget_items)) {
        let budgets = {};
        incoming_budgets.forEach((record) => totalBudget += record.value);
        budgets.budget_items = incoming_budgets;
        budgets.total_budget = totalBudget;
        budgets.requested = true;
        budgets.isFetching = false;
        return { ...state, ...budgets };
      } else {
        return { ...state, isFetching: false, requested: true  };
      }
    case CREATE_BUDGET_RECORD:
      let all_budget_records = state.budget_items;
      all_budget_records.push(payload.data);
      let all_budgets = {};
      let totalNewBudgets = 0;
      all_budget_records.forEach((record) => totalNewBudgets += record.value);
      all_budgets.total_budget = totalNewBudgets;
      all_budgets.budget_items = all_budget_records;
      return { ...state, ...all_budgets };
    case UPDATE_BUDGET_RECORD:
      let all_previous_budget_records = state.budget_items.filter((a) => a.id !== payload.ID);
      all_previous_budget_records.push(payload.data);
      let totalUpdatedBudgets = 0;
      let new_budgets_config = {};
      all_previous_budget_records.forEach((record) => totalUpdatedBudgets += record.value);
      new_budgets_config.budget_items = all_previous_budget_records;
      new_budgets_config.total_budget = totalUpdatedBudgets;
      return { ...state, ...new_budgets_config };
    case DELETE_BUDGET_RECORD:
      let all_preserved_budget_records = state.budget_items.filter((a) => a.id !== payload);
      let totalPreservedBudget = 0;
      let preserved_budget_config = {};
      all_preserved_budget_records.forEach((record) => totalPreservedBudget += record.value);
      preserved_budget_config.budget_items = all_preserved_budget_records;
      preserved_budget_config.total_budget = totalPreservedBudget;
      return { ...state, ...preserved_budget_config };
    case OPEN_CREATE_BUDGET_MODAL:
      let open_budgets_config = {};
      open_budgets_config.creating_budget = true;
      open_budgets_config.type = payload.type;
      open_budgets_config.defaults = payload.defaults;
      open_budgets_config.updating = payload.updating;
      open_budgets_config.viewing = payload.viewing;
      open_budgets_config.simulation = payload.simulation;
      return { ...state, ...open_budgets_config };
    case CLOSE_CREATE_BUDGET_MODAL:
      let close_budget_config = {};
      close_budget_config.creating_budget = false;
      close_budget_config.type = "";
      close_budget_config.defaults = {};
      close_budget_config.updating = false;
      close_budget_config.viewing = false;
      close_budget_config.simulation = false;
      return { ...state, ...close_budget_config };
    case IS_FETCHING_BUDGETS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_BUDGETS:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return { ...defaultState, budget_items: [] };
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default budgetsReducer;
