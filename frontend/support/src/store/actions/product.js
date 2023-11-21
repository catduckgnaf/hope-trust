import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import {
  OPEN_CREATE_PRODUCT_MODAL,
  CLOSE_CREATE_PRODUCT_MODAL,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT
} from "./constants";
import { showNotification } from "./notification";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const createProduct = (new_product) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/stripe/create-stripe-product/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        new_product
      }
    }).then((data) => {
      dispatch({ type: CREATE_PRODUCT, payload: data.payload });
      return data;
    }).catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const updateProduct = (ID, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/stripe/update-stripe-product/${ID}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      if (data.success) dispatch({ type: UPDATE_PRODUCT, payload: { data: data.payload, ID } });
      return data;
    }).catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const deleteProduct = (ID, price_id) => async (dispatch) => {
  dispatch({ type: DELETE_PRODUCT, payload: ID });
  return API.del(
    Gateway.name,
    `/stripe/delete-stripe-product/${ID}/${price_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true };
    }).catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const createSubscription = (createdUser, fields, initial_discount, free_plan) => async (dispatch) => {
  return await API.post(
    Gateway.name,
    `/stripe/create-subscription/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        new_customer: {
          phone: createdUser.home_phone,
          name: `${createdUser.first_name} ${createdUser.last_name}`,
          email: createdUser.email.toLowerCase(),
          token: fields.tokenResponse ? fields.tokenResponse.token : null
        },
        plan: fields.plan_choice,
        failure_plan: free_plan,
        charge_config: {
          total: fields.plan_choice.one_time_fee || (fields.plan_choice.monthly - initial_discount),
          line_item_description: `First Month Subscription - ${fields.plan_choice.name}`,
          invoice_description: `Hope Trust - ${fields.plan_choice.name} Subscription`,
          coupon: fields.discountCode
        },
        subscription_config: {
          quantity: 0,
          discount_code: fields.discountCode
        },
        type: "user",
        charge_type: fields.responsibility,
        customer_id: fields.responsibility === "credits" ? fields.partner.customer_id : false,
        target_account_id: createdUser.cognito_id,
        cognito_id: createdUser.cognito_id
      }
    }
  );
};

export const verifyDiscount = (code) => async (dispatch) => {
  if (code) {
    return API.post(Gateway.name, "/stripe/verify-discount-code", { body: { code } })
      .then((coupon) => {
        if (coupon.success) {
          return coupon.payload;
        } else {
          dispatch(showNotification("error", "Discount Code", coupon.message));
        }
      })
      .catch((error) => {
        dispatch(showNotification("error", "Discount Verification", error.response.data.message));
        return false;
      });
  } else {
    dispatch(showNotification("error", "Discount Verification", "You must enter a discount code."));
    return false;
  }
};

export const openCreateProductModal = (defaults, updating, viewing, current_page) => async (dispatch) => {
  dispatch({ type: OPEN_CREATE_PRODUCT_MODAL, payload: { defaults, updating, viewing, current_page } });
};

export const closeCreateProductModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CREATE_PRODUCT_MODAL });
};