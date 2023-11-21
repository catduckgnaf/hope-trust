import {
  OPEN_CREATE_RELATIONSHIP_MODAL,
  CLOSE_CREATE_RELATIONSHIP_MODAL
} from "./constants";

export const openCreateRelationshipModal = (defaults, updating, viewing, account_id, target_hubspot_deal_id, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_RELATIONSHIP_MODAL, payload: { defaults, updating, viewing, account_id, target_hubspot_deal_id, current_page } });
};

export const closeCreateRelationshipModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_RELATIONSHIP_MODAL });
};
