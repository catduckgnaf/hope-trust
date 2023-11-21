import {
  GET_ACCOUNT_BENEFICIARY_ASSETS,
  CREATE_BENEFICIARY_ASSET_RECORDS,
  CREATE_BENEFICIARY_ASSET_RECORD,
  UPDATE_BENEFICIARY_ASSET_RECORD,
  DELETE_BENEFICIARY_ASSET_RECORD,
  OPEN_CREATE_BENEFICIARY_ASSET_MODAL,
  CLOSE_CREATE_BENEFICIARY_ASSET_MODAL,
  IS_FETCHING_BENEFICIARY_ASSETS,
  HAS_REQUESTED_BENEFICIARY_ASSETS,
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
    total_assets: 0,
    finance_type: "",
    type: "",
    source: "",
    requested: false,
    isFetching: false
  };

const beneficiaryAssetsReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case GET_ACCOUNT_BENEFICIARY_ASSETS:
      let totalAssets = 0;
      if (!isEqual(payload.data, state.list)) {
        let assets = {};
        payload.data.forEach((record) => totalAssets += record.value);
        assets.creating_asset = false;
        assets.requested = true;
        assets.isFetching = false;
        assets.list = payload.data;
        assets.total_assets = totalAssets;
        return { ...state, ...assets };
      } else {
        return { ...state, isFetching: false, requested: true };
      }
    case CREATE_BENEFICIARY_ASSET_RECORD:
      let all_asset_records = state.list;
      all_asset_records.push(payload.data);
      let all_assets = {};
      all_assets.list = all_asset_records;
      return { ...state, ...all_assets };
    case CREATE_BENEFICIARY_ASSET_RECORDS:
      let totalAccountAssets = 0;
      let updated_assets_config = {};
      payload.data.forEach((record) => totalAccountAssets += record.value);
      updated_assets_config.list = [...state.list, ...payload.data];
      updated_assets_config.total_assets =  totalAccountAssets;
      return { ...state, ...updated_assets_config };
    case UPDATE_BENEFICIARY_ASSET_RECORD:
      let all_previous_finance_records = state.list.filter((a) => a.id !== payload.ID);
      all_previous_finance_records.push(payload.data);
      let totalUpdatedAssets = 0;
      let new_assets_config = {};
      all_previous_finance_records.forEach((record) => totalUpdatedAssets += record.value);
      new_assets_config.list = all_previous_finance_records;
      new_assets_config.total_assets = totalUpdatedAssets;
      return { ...state, ...new_assets_config };
    case DELETE_BENEFICIARY_ASSET_RECORD:
      let all_preserved_finance_records = state.list.filter((a) => a.id !== payload);
      let totalPreservedAssets = 0;
      let preserved_assets_config = {};
      all_preserved_finance_records.forEach((record) => totalPreservedAssets += record.value);
      preserved_assets_config.list = all_preserved_finance_records;
      preserved_assets_config.total_assets = totalPreservedAssets;
      return { ...state, ...preserved_assets_config };
    case OPEN_CREATE_BENEFICIARY_ASSET_MODAL:
      let open_assets_config = {};
      open_assets_config.creating_asset = true;
      open_assets_config.type = payload.type;
      open_assets_config.finance_type = payload.finance_type;
      open_assets_config.source = payload.source;
      open_assets_config.defaults = payload.defaults;
      open_assets_config.updating = payload.updating;
      open_assets_config.viewing = payload.viewing;
      return { ...state, ...open_assets_config };
    case CLOSE_CREATE_BENEFICIARY_ASSET_MODAL:
      let close_assets_config = {};
      close_assets_config.creating_asset = false;
      close_assets_config.type = "";
      close_assets_config.finance_type = "";
      close_assets_config.source = "";
      close_assets_config.defaults = {};
      close_assets_config.updating = false;
      close_assets_config.viewing = false;
      return { ...state, ...close_assets_config };
    case IS_FETCHING_BENEFICIARY_ASSETS:
      return { ...state, isFetching: payload };
    case HAS_REQUESTED_BENEFICIARY_ASSETS:
      return { ...state, requested: payload };
    case CLEAR_ALL:
      return { ...defaultState, list: [] };
    case LOCATION_CHANGE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

export default beneficiaryAssetsReducer;
