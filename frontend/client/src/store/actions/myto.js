import {
  RUN_MYTO_SIMULATION,
  UPDATE_MYTO_CONFIG,
  IMPORT_MYTO_FINANCES,
  SWITCH_MYTO_VIEW,
  UPDATE_MYTO_SIMULATION,
  DELETE_MYTO_SIMULATION,
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
  GET_MYTO_SIMULATIONS,
  IS_FETCHING_MYTO_SIMULATIONS,
  HAS_REQUESTED_MYTO_SIMULATIONS,
  SHOW_LOADER,
  CHANGE_MYTO_STEP,
  OPEN_MYTO_SIMULATION,
  CLOSE_MYTO_SIMULATION,
  CLEAR_MYTO_CALCULATOR,
  RETRY_MYTO,
  RESET_MYTO_RETRYS,
  LOAD_SIMULATION
} from "./constants";
import { toastr } from "react-redux-toastr";
import { showNotification } from "./notification";
import { uniqueID, getUserAge } from "../../utilities";
import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { logEvent } from "./utilities";
import { store } from "..";
import { openCreateBenefitModal } from "./benefits";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const getMYTOSimulations = (override = false, startAt = 0, limit) => async (dispatch) => {
  if ((!store.getState().myto.isFetching && !store.getState().myto.requested) || override) {
    dispatch({ type: IS_FETCHING_MYTO_SIMULATIONS, payload: true });
    try {
      const data = await API.get(
      Gateway.name,
      `/finance/get-myto-simulations/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        queryStringParameters: {
          startAt,
          limit
        }
      });
      if (data.success) {
        dispatch({ type: GET_MYTO_SIMULATIONS, payload: data.payload });
        dispatch({ type: IS_FETCHING_MYTO_SIMULATIONS, payload: false });
        return data.payload;
      } else {
        dispatch({ type: HAS_REQUESTED_MYTO_SIMULATIONS, payload: true });
        dispatch({ type: IS_FETCHING_MYTO_SIMULATIONS, payload: false });
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_MYTO_SIMULATIONS, payload: true });
      dispatch({ type: IS_FETCHING_MYTO_SIMULATIONS, payload: false });
    }
  }
};

export const loadSimulation = (simulation) => async (dispatch) => {
  const grantor_assets = JSON.parse(simulation.grantor_assets);
  const income = JSON.parse(simulation.income) || [];
  const benefits = JSON.parse(simulation.benefits) || [];
  const budgets = JSON.parse(simulation.budgets) || [];

  dispatch({
    type: LOAD_SIMULATION,
    payload: {
      grantor_assets,
      income,
      benefits,
      budgets,
      config: {
        annual_management_costs: simulation.annual_management_costs,
        portfolio_risk_weighting: simulation.portfolio_risk_weighting,
        desired_life_of_fund: simulation.desired_life_of_fund,
        concierge_services: simulation.concierge_services,
        children_total: simulation.children_total,
        beneficiary_age: simulation.beneficiary_age,
        simulation_name: ""
      }
    }
  });
};

export const runActualSimulation = () => async (dispatch) => {
  const beneficiary = store.getState().relationship.list.find((u) => u.type === "beneficiary");
  const config = store.getState().myto.config;
  const grantor_assets = store.getState().grantor_assets;
  const income = store.getState().income || [];
  const benefits = store.getState().benefits || [];
  const budgets = store.getState().budgets || [];

  dispatch({
    type: LOAD_SIMULATION,
    payload: {
      grantor_assets: grantor_assets.list,
      income: income.income_sources,
      benefits: benefits.government_benefits,
      budgets: budgets.budget_items,
      config: {
        annual_management_costs: config.annual_management_costs,
        portfolio_risk_weighting: config.portfolio_risk_weighting,
        desired_life_of_fund: (100 - getUserAge(beneficiary.birthday)),
        concierge_services: config.concierge_services,
        children_total: config.children_total,
        beneficiary_age: getUserAge(beneficiary.birthday),
        simulation_name: config.simulation_name
      }
    }
  });
  dispatch({ type: CHANGE_MYTO_STEP, payload: 3 });
  dispatch({ type: UPDATE_MYTO_CONFIG, payload: { key: "is_actual", value: true } });
};

export const runIndividualSimulation = (simulation) => async (dispatch) => {
  const config = store.getState().myto.config;
  const grantor_assets = JSON.parse(simulation.grantor_assets) || [];
  const income = JSON.parse(simulation.income) || [];
  const benefits = JSON.parse(simulation.benefits) || [];
  const budgets = JSON.parse(simulation.budgets) || [];

  const results = await API.post(
    Gateway.name,
    `/finance/calculate-myto/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        simulation: {
          beneficiary_age: Number(simulation.beneficiary_age),
          income_items: income,
          budget_items: budgets,
          grantor_asset_items: grantor_assets,
          benefit_items: benefits,
          concierge_services: simulation.concierge_services,
          annual_management_costs: config.annual_management_costs,
          portfolio_risk_weighting: config.portfolio_risk_weighting,
          desired_life_of_fund: simulation.desired_life_of_fund,
          children_total: simulation.children_total
        }
      }
    });

  if (results.success) {
    const { myto_config, with_benefits, without_benefits } = results.payload;

    const {
      age,
      children_total,
      mgmt,
      risk,
      desired_life_of_fund,
      total_benefits_value,
      total_available_assets,
      current_available_assets
    } = myto_config;

    const {
      final_average,
      assets_needed,
      trust_funding_gap
    } = with_benefits;

    const {
      nfinal_average,
      nassets_needed,
      trust_fund_gap_without_benefits
    } = without_benefits;
    if (!benefits.length || ((nfinal_average - final_average) >= 0)) {
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch({ type: RESET_MYTO_RETRYS });
      return {
        id: simulation.id,
        grantor_assets: simulation.grantor_assets,
        income: simulation.income,
        benefits: simulation.benefits,
        budgets: simulation.budgets,
        beneficiary_age: Number(age),
        concierge_services: simulation.concierge_services,
        annual_management_costs: mgmt,
        portfolio_risk_weighting: risk,
        desired_life_of_fund,
        children_total,
        total_benefits_value,
        final_average,
        final_average_without_benefits: nfinal_average,
        current_available: current_available_assets,
        assets_needed_with_benefits: assets_needed,
        nassets_needed_without_benefits: nassets_needed,
        total_available_assets,
        trust_funding_gap,
        trust_fund_gap_without_benefits,
        details: simulation.details,
        simulation_name: simulation.simulation_name
      };
    } else {
      if (store.getState().myto.retrys < store.getState().myto.max_retrys) {
        dispatch({ type: RETRY_MYTO });
        dispatch(runIndividualSimulation(simulation));
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Refining Calculation..." } });
      } else if (store.getState().myto.retrys >= store.getState().myto.max_retrys) {
        const confirmOptions = {
          onOk: () => {
            dispatch(openCreateBenefitModal({}, false, false, false));
            dispatch({ type: CLEAR_MYTO_CALCULATOR });
            dispatch({ type: SWITCH_MYTO_VIEW, payload: "simulations" });
          },
          onCancel: () => toastr.removeByType("confirms"),
          okText: "Create New Benefit",
          cancelText: "Close"
        };
        toastr.confirm("Simulation Invalid\n\nIn order to simulate a benefits gap, you must add government benefit records with monetary value.", confirmOptions);
        dispatch({ type: RESET_MYTO_RETRYS });
        dispatch({ type: SHOW_LOADER, payload: { show: false } });
      }
      return false;
    }
  } else {
    dispatch({ type: SHOW_LOADER, payload: { show: false } });
    dispatch(showNotification("error", "Calculation Error", results.message));
    return false;
  }
};

export const runMytoSimulation = (state_config) => async (dispatch) => {
  const config = { ...store.getState().myto.config, ...state_config };
  const grantor_assets = store.getState().myto.grantor_assets;
  const income = store.getState().myto.income || [];
  const benefits = store.getState().myto.benefits || [];
  const budgets = store.getState().myto.budgets || [];

  const results = await API.post(
    Gateway.name,
    `/finance/calculate-myto/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        simulation: {
          beneficiary_age: Number(config.beneficiary_age),
          income_items: income,
          budget_items: budgets,
          grantor_asset_items: grantor_assets,
          benefit_items: benefits,
          concierge_services: config.concierge_services,
          annual_management_costs: config.annual_management_costs,
          portfolio_risk_weighting: config.portfolio_risk_weighting,
          desired_life_of_fund: config.desired_life_of_fund,
          children_total: config.children_total
        }
      }
    });

  if (results.success) {
    // deconstruct calculator response
    const { myto_config, with_benefits, without_benefits } = results.payload;
    const {
      age,
      children_total,
      mgmt,
      risk,
      desired_life_of_fund,
      total_benefits_value,
      total_available_assets,
      current_available_assets
    } = myto_config;

    const {
      final_average,
      assets_needed,
      trust_funding_gap
    } = with_benefits;

    const {
      nfinal_average,
      nassets_needed,
      trust_fund_gap_without_benefits
    } = without_benefits;

    if (!benefits.length || ((nfinal_average - final_average) >= 0)) {
      return API.post(
        Gateway.name,
        `/finance/create-myto-simulation/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          },
          body: {
            simulation: {
              grantor_assets: JSON.stringify(grantor_assets),
              benefits: JSON.stringify(benefits),
              budgets: JSON.stringify(budgets),
              income: JSON.stringify(income),
              beneficiary_age: Number(age),
              concierge_services: config.concierge_services,
              annual_management_costs: mgmt,
              portfolio_risk_weighting: risk,
              desired_life_of_fund,
              children_total,
              total_benefits_value,
              final_average,
              final_average_without_benefits: nfinal_average,
              current_available: current_available_assets,
              assets_needed_with_benefits: assets_needed,
              nassets_needed_without_benefits: nassets_needed,
              total_available_assets,
              trust_funding_gap,
              trust_fund_gap_without_benefits,
              details: config.details,
              simulation_name: config.simulation_name,
              default_simulation: store.getState().myto.simulations.length ? false : true,
              is_actual: config.is_actual
            }
          }
        }).then((data) => {
          if (data.success) {
            dispatch({ type: CLEAR_MYTO_CALCULATOR });
            dispatch({ type: RUN_MYTO_SIMULATION, payload: { simulation: data.payload } });
            dispatch(getMYTOSimulations(true, 0, 100));
            dispatch({ type: OPEN_MYTO_SIMULATION, payload: data.payload });
            dispatch({ type: SHOW_LOADER, payload: { show: false } });
            return { success: true };
          }
        }).catch((error) => {
          return {
            success: false,
            error
          };
        });
    } else {
      if (store.getState().myto.retrys < store.getState().myto.max_retrys) {
        dispatch({ type: RETRY_MYTO });
        dispatch(runMytoSimulation(state_config));
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Refining Calculation..." } });
      } else if (store.getState().myto.retrys >= store.getState().myto.max_retrys) {
        const confirmOptions = {
          onOk: () => {
            dispatch(openCreateBenefitModal({}, false, false, false));
            dispatch({ type: CLEAR_MYTO_CALCULATOR });
            dispatch({ type: SWITCH_MYTO_VIEW, payload: "simulations" });
          },
          onCancel: () => toastr.removeByType("confirms"),
          okText: "Create New Benefit",
          cancelText: "Close"
        };
        toastr.confirm("Simulation Invalid\n\nIn order to simulate a benefits gap, you must add government benefit records with monetary value.", confirmOptions);
        dispatch({ type: RESET_MYTO_RETRYS });
        dispatch({ type: SHOW_LOADER, payload: { show: false } });
      }
      return { success: false };
    }
  } else {
    dispatch({ type: SHOW_LOADER, payload: { show: false } });
    dispatch(showNotification("error", "Calculation Error", results.message));
    return { success: false };
  }
};
export const updateMYTOSimulation = (id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/finance/update-single-myto-simulation/${id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: UPDATE_MYTO_SIMULATION, payload: { id, data: data.payload } });
      dispatch(getMYTOSimulations(true, 0, 100));
      return data;
    }).catch((error) => {
      return {
        success: false,
        error
      };
    });
};
export const deleteMYTOSimulation = (id) => async (dispatch) => {
  dispatch({ type: DELETE_MYTO_SIMULATION, payload: id });
  return API.del(
    Gateway.name,
    `/finance/delete-single-myto-simulation/${id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
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
export const importMYTOFinance = (key, list_key) => async (dispatch) => {
  const items = store.getState()[key][list_key];
  dispatch({ type: IMPORT_MYTO_FINANCES, payload: { key, items } });
};
export const updateMYTOConfig = (key, value) => async (dispatch) => {
  dispatch({ type: UPDATE_MYTO_CONFIG, payload: { key, value } });
};
export const switchMYTOView = (view) => async (dispatch) => {
  dispatch({ type: SWITCH_MYTO_VIEW, payload: view });
};
export const addMytoAsset = (asset) => async (dispatch) => {
  dispatch({ type: ADD_MYTO_ASSET, payload: { asset: { ...asset, id: uniqueID() } } });
};
export const updateMytoAsset = (id, updates) => async (dispatch) => {
  dispatch({ type: UPDATE_MYTO_ASSET, payload: { id, updates } });
};
export const deleteMytoAsset = (id) => async (dispatch) => {
  dispatch({ type: DELETE_MYTO_ASSET, payload: id });
};
export const addMytoIncome = (income) => async (dispatch) => {
  dispatch({ type: ADD_MYTO_INCOME, payload: { income: { ...income, id: uniqueID() } } });
};
export const updateMytoIncome = (id, updates) => async (dispatch) => {
  dispatch({ type: UPDATE_MYTO_INCOME, payload: { id, updates } });
};
export const deleteMytoIncome = (id) => async (dispatch) => {
  dispatch({ type: DELETE_MYTO_INCOME, payload: id });
};
export const addMytoBenefit = (benefit) => async (dispatch) => {
  dispatch({ type: ADD_MYTO_BENEFIT, payload: { benefit: { ...benefit, id: uniqueID() } } });
};
export const updateMytoBenefit = (id, updates) => async (dispatch) => {
  dispatch({ type: UPDATE_MYTO_BENEFIT, payload: { id, updates } });
};
export const deleteMytoBenefit = (id) => async (dispatch) => {
  dispatch({ type: DELETE_MYTO_BENEFIT, payload: id });
};
export const addMytoExpense = (expense) => async (dispatch) => {
  dispatch({ type: ADD_MYTO_EXPENSE, payload: { expense: { ...expense, id: uniqueID() } } });
};
export const updateMytoExpense = (id, updates) => async (dispatch) => {
  dispatch({ type: UPDATE_MYTO_EXPENSE, payload: { id, updates } });
};
export const deleteMytoExpense = (id) => async (dispatch) => {
  dispatch({ type: DELETE_MYTO_EXPENSE, payload: id });
};
export const change_myto_step = (step) => async (dispatch) => {
  dispatch({ type: CHANGE_MYTO_STEP, payload: step });
};
export const openMYTOSimulation = (simulation) => async (dispatch) => {
  dispatch({ type: OPEN_MYTO_SIMULATION, payload: simulation });
  dispatch(logEvent("myto-simulation", store.getState().user, "modal"));
};
export const closeMYTOSimulation = () => async (dispatch) => {
  dispatch({ type: CLOSE_MYTO_SIMULATION });
};
export const clear_myto = () => async (dispatch) => {
  dispatch({ type: CLEAR_MYTO_CALCULATOR });
};