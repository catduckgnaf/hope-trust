import {
  RUN_MYTO_SIMULATION,
  UPDATE_MYTO_CONFIG,
  IMPORT_MYTO_FINANCES,
  UPDATE_MYTO_SIMULATION,
  DELETE_MYTO_SIMULATION,
  SWITCH_MYTO_VIEW,
  GET_MYTO_SIMULATIONS,
  IS_FETCHING_MYTO_SIMULATIONS,
  HAS_REQUESTED_MYTO_SIMULATIONS,
  ADD_MYTO_ASSET,
  UPDATE_MYTO_ASSET,
  DELETE_MYTO_ASSET,
  ADD_MYTO_INCOME,
  UPDATE_MYTO_INCOME,
  DELETE_MYTO_INCOME,
  ADD_MYTO_BENEFIT,
  UPDATE_MYTO_BENEFIT,
  DELETE_MYTO_BENEFIT,
  ADD_MYTO_EXPENSE,
  UPDATE_MYTO_EXPENSE,
  DELETE_MYTO_EXPENSE,
  CHANGE_MYTO_STEP,
  OPEN_MYTO_SIMULATION,
  CLOSE_MYTO_SIMULATION,
  LOAD_SIMULATION,
  CLEAR_MYTO_CALCULATOR,
  RETRY_MYTO,
  RESET_MYTO_RETRYS,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";
import { uniqBy } from "lodash";

const defaultState = {
  config: {
    annual_management_costs: 1.5,
    portfolio_risk_weighting: 33,
    desired_life_of_fund: 0,
    concierge_services: 2,
    children_total: 1,
    beneficiary_age: 0,
    simulation_name: "",
    is_actual: false
  },
  focused_simulation: false,
  viewing_simulation: false,
  current_step: 0,
  view: "simulations",
  simulations: [],
  grantor_assets: [],
  income: [],
  benefits: [],
  budgets: [],
  isFetching: false,
  requested: false,
  is_retrying: false,
  retrys: 0,
  max_retrys: 2
};
const loaderReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_MYTO_SIMULATIONS:
      return { ...state, simulations: payload, isFetching: false, requested: true };
    case LOAD_SIMULATION:
      return { ...state, grantor_assets: payload.grantor_assets, income: payload.income, benefits: payload.benefits, budgets: payload.budgets, config: { ...payload.config, is_actual: false }, current_step: 0, view: "calculator" };
    case RUN_MYTO_SIMULATION:
      return { ...state, simulations: [payload.simulation, ...state.simulations.slice(0, 9)], view: "simulations", config: { ...defaultState.config, is_actual: false }, current_step: 0, retrys: 0, is_retrying: false };
    case UPDATE_MYTO_SIMULATION:
      const preserved_simulations = state.simulations.filter((sim) => sim.id !== payload.id);
      return { ...state, simulations: [...preserved_simulations, payload.data], view: "simulations", requested: false };
    case DELETE_MYTO_SIMULATION:
      const preserved_simulations_after_deletion = state.simulations.filter((sim) => sim.id !== payload);
      return { ...state, simulations: preserved_simulations_after_deletion, view: "simulations" };
    case UPDATE_MYTO_CONFIG:
      return { ...state, config: { ...state.config, [payload.key]: payload.value } };
    case IMPORT_MYTO_FINANCES:
      const current_records = state[payload.key];
      const all_items = [...current_records, ...payload.items];
      return { ...state, [payload.key]: uniqBy(all_items, "id") };
    case SWITCH_MYTO_VIEW:
      return { ...state, view: payload, current_step: 0 };
    case ADD_MYTO_ASSET:
      return { ...state, grantor_assets: [...state.grantor_assets, payload.asset] };
    case UPDATE_MYTO_ASSET:
      const updated_asset = state.grantor_assets.find((sim) => sim.id === payload.id);
      const non_updated_assets = state.grantor_assets.filter((sim) => sim.id !== payload.id);
      return { ...state, grantor_assets: [...non_updated_assets, { ...updated_asset, ...payload.updates }] };
    case DELETE_MYTO_ASSET:
      const non_deleted_assets = state.grantor_assets.filter((sim) => sim.id !== payload);
      return { ...state, grantor_assets: non_deleted_assets };
    case ADD_MYTO_INCOME:
      return { ...state, income: [...state.income, payload.income] };
    case UPDATE_MYTO_INCOME:
      const updated_income = state.income.find((sim) => sim.id === payload.id);
      const non_updated_incomes = state.income.filter((sim) => sim.id !== payload.id);
      return { ...state, income: [...non_updated_incomes, { ...updated_income, ...payload.updates }] };
    case DELETE_MYTO_INCOME:
      const non_deleted_incomes = state.income.filter((sim) => sim.id !== payload);
      return { ...state, income: non_deleted_incomes };
    case ADD_MYTO_BENEFIT:
      return { ...state, benefits: [...state.benefits, payload.benefit] };
    case UPDATE_MYTO_BENEFIT:
      const updated_benefit = state.benefits.find((sim) => sim.id === payload.id);
      const non_updated_benefits = state.benefits.filter((sim) => sim.id !== payload.id);
      return { ...state, benefits: [...non_updated_benefits, { ...updated_benefit, ...payload.updates }] };
    case DELETE_MYTO_BENEFIT:
      const non_deleted_benefits = state.benefits.filter((sim) => sim.id !== payload);
      return { ...state, benefits: non_deleted_benefits };
    case ADD_MYTO_EXPENSE:
      return { ...state, budgets: [...state.budgets, payload.expense] };
    case UPDATE_MYTO_EXPENSE:
      const updated_expense = state.budgets.find((sim) => sim.id === payload.id);
      const non_updated_expenses = state.budgets.filter((sim) => sim.id !== payload.id);
      return { ...state, budgets: [...non_updated_expenses, { ...updated_expense, ...payload.updates }] };
    case DELETE_MYTO_EXPENSE:
      const non_deleted_expenses = state.budgets.filter((sim) => sim.id !== payload);
      return { ...state, budgets: non_deleted_expenses };
    case IS_FETCHING_MYTO_SIMULATIONS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_MYTO_SIMULATIONS:
      return { ...state, requested: payload };
    case CHANGE_MYTO_STEP:
      return { ...state, current_step: payload };
    case OPEN_MYTO_SIMULATION:
      return { ...state, focused_simulation: payload, viewing_simulation: true };
    case CLOSE_MYTO_SIMULATION:
      return { ...state, viewing_simulation: false };
    case CLEAR_MYTO_CALCULATOR:
      return { ...defaultState, config: { ...defaultState.config, is_actual: false }, view: "calculator", isFetching: false, requested: true, simulations: state.simulations };
    case RETRY_MYTO:
      return { ...state, retrys: state.retrys + 1, is_retrying: true };
    case RESET_MYTO_RETRYS:
      return { ...state, retrys: 0, is_retrying: false };
    case CLEAR_ALL:
      return defaultState;
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default loaderReducer;
