import {
  GET_ACCOUNT_GRANTOR_ASSETS,
  CREATE_GRANTOR_ASSET_RECORDS,
  CREATE_GRANTOR_ASSET_RECORD,
  UPDATE_GRANTOR_ASSET_RECORD,
  DELETE_GRANTOR_ASSET_RECORD,
  OPEN_CREATE_GRANTOR_ASSET_MODAL,
  CLOSE_CREATE_GRANTOR_ASSET_MODAL,
  IS_FETCHING_GRANTOR_ASSETS,
  HAS_REQUESTED_GRANTOR_ASSETS,
  CLEAR_ALL,
  LOCATION_CHANGE
} from "../actions/constants";
import { isEqual } from "lodash";

const defaultState = {
    list: [],
    creating_asset: false,
    defaults: {},
    updating: false,
    viewing: false,
    simulation: false,
    total_assets: 0,
    finance_type: "",
    type: "",
    source: "",
    requested: false,
    isFetching: false
  };

const assetsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACCOUNT_GRANTOR_ASSETS:
      let totalAssets = 0;
      if (!isEqual(payload.data, state.list)) {
        let assets = {};
        payload.data.forEach((record) => totalAssets += record.trust_assets);
        assets.creating_asset = false;
        assets.requested = true;
        assets.isFetching = false;
        assets.list = payload.data;
        assets.total_assets = totalAssets;
        return { ...state, ...assets };
      } else {
        return { ...state, isFetching: false, requested: true };
      }
    case CREATE_GRANTOR_ASSET_RECORD:
      let all_asset_records = state.list;
      all_asset_records.push(payload.data);
      let all_assets = {};
      let totalNewAssets = 0;
      all_asset_records.forEach((record) => totalNewAssets += record.trust_assets);
      all_assets.total_assets = totalNewAssets;
      all_assets.list = all_asset_records;
      return { ...state, ...all_assets };
    case CREATE_GRANTOR_ASSET_RECORDS:
      let totalAccountAssets = 0;
      let updated_assets_config = {};
      payload.data.forEach((record) => totalAccountAssets += record.trust_assets);
      updated_assets_config.list = [...state.list, ...payload.data];
      updated_assets_config.total_assets =  totalAccountAssets;
      return { ...state, ...updated_assets_config };
    case UPDATE_GRANTOR_ASSET_RECORD:
      let all_previous_finance_records = state.list.filter((a) => a.id !== payload.ID);
      all_previous_finance_records.push(payload.data);
      let totalUpdatedAssets = 0;
      let new_assets_config = {};
      all_previous_finance_records.forEach((record) => totalUpdatedAssets += record.trust_assets);
      new_assets_config.list = all_previous_finance_records;
      new_assets_config.total_assets = totalUpdatedAssets;
      return { ...state, ...new_assets_config };
    case DELETE_GRANTOR_ASSET_RECORD:
      let all_preserved_finance_records = state.list.filter((a) => a.id !== payload);
      let totalPreservedAssets = 0;
      let preserved_assets_config = {};
      all_preserved_finance_records.forEach((record) => totalPreservedAssets += record.trust_assets);
      preserved_assets_config.list = all_preserved_finance_records;
      preserved_assets_config.total_assets = totalPreservedAssets;
      return { ...state, ...preserved_assets_config };
    case OPEN_CREATE_GRANTOR_ASSET_MODAL:
      let open_assets_config = {};
      open_assets_config.creating_asset = true;
      open_assets_config.type = payload.type;
      open_assets_config.finance_type = payload.finance_type;
      open_assets_config.source = payload.source;
      open_assets_config.defaults = payload.defaults;
      open_assets_config.updating = payload.updating;
      open_assets_config.viewing = payload.viewing;
      open_assets_config.simulation = payload.simulation;
      return { ...state, ...open_assets_config };
    case CLOSE_CREATE_GRANTOR_ASSET_MODAL:
      let close_assets_config = {};
      close_assets_config.creating_asset = false;
      close_assets_config.type = "";
      close_assets_config.finance_type = "";
      close_assets_config.source = "";
      close_assets_config.defaults = {};
      close_assets_config.updating = false;
      close_assets_config.viewing = false;
      close_assets_config.simulation = false;
      return { ...state, ...close_assets_config };
    case IS_FETCHING_GRANTOR_ASSETS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_GRANTOR_ASSETS:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return { ...defaultState, list: [] };
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default assetsReducer;
