import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { getAccounts, getCustomerTransactions } from "./account";
import { showNotification } from "./notification";
import { logEvent } from "./utilities";
import authenticated from "./authentication";
import { getCurrentUser } from "./user";
import { updatePartner } from "./partners";
import { navigateTo } from "./navigation";
import { store } from "..";
import {
  GET_ACCOUNT_CUSTOMER,
  IS_FETCHING_CUSTOMER,
  HAS_REQUESTED_ACCOUNT_CUSTOMER,
  OPEN_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL,
  CLOSE_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL,
  SHOW_LOADER,
  UPDATE_LOGGEDIN_USER,
  CLEAR_ALL,
  SET_SESSION_ACCOUNT,
  IS_LOGGED_IN,
  IS_SWITCHING,
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION,
  OPEN_PAYMENT_METHODS_MODAL,
  CLOSE_PAYMENT_METHODS_MODAL,
  HIDE_LOADER
} from "./constants";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const createStripeCustomer = (details) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/stripe/create-stripe-customer/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        ...details
      }
    })
    .then((created) => {
      dispatch(logEvent("stripe customer created", store.getState().user));
      return created.payload;
    })
    .catch((error) => {
      dispatch(showNotification("error", "Customer Creation", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const deletePaymentSource = (customer_id, source_id) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/stripe/delete-payment-source/${customer_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        source_id
      }
    })
    .then((deleted) => {
      dispatch(showNotification("success", "Payment Method Deleted", "We successfully removed this payment method from your account."));
      if (deleted.success) {
        dispatch({ type: GET_ACCOUNT_CUSTOMER, payload: deleted.payload });
        dispatch(logEvent("payment source deleted", store.getState().user));
      }
      return deleted;
    })
    .catch((error) => {
      dispatch(showNotification("error", "Payment Method Removal", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const updateStripeCustomer = (customer_id, updates) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/stripe/update-stripe-customer/${customer_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        updates
      }
    })
    .then((updated) => {
      dispatch(showNotification("success", "Customer Updated", "We successfully updated your customer record."));
      if (updated.success) {
        dispatch({ type: GET_ACCOUNT_CUSTOMER, payload: updated.payload });
        dispatch(logEvent("stripe customer updated", store.getState().user));
      }
      return updated;
    })
    .catch((error) => {
      dispatch(showNotification("error", "Customer Update", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const getStripeExpandedCustomer = (override = false, customer_id) => async (dispatch) => {
  if ((!store.getState().account.isFetchingCustomer && !store.getState().account.requestedCustomer) || override) {
    dispatch({ type: IS_FETCHING_CUSTOMER, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/stripe/get-stripe-customer/${customer_id}/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            Authorization: store.getState().session.token
          }
        });
      if (data.success) {
        dispatch({ type: GET_ACCOUNT_CUSTOMER, payload: data.payload });
        dispatch({ type: IS_FETCHING_CUSTOMER, payload: false });
        return data;
      } else {
        dispatch({ type: HAS_REQUESTED_ACCOUNT_CUSTOMER, payload: true });
        dispatch({ type: IS_FETCHING_CUSTOMER, payload: false });
        return data;
      }
    } catch (error) {
      dispatch({ type: HAS_REQUESTED_ACCOUNT_CUSTOMER, payload: true });
      dispatch({ type: IS_FETCHING_CUSTOMER, payload: false });
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    }
  }
};

export const createMultilineInvoice = (products, customer_id) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Updating..." } });
  return API.post(
    Gateway.name,
    `/stripe/create-multi-invoice/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        products,
        customer_id
      }
    })
    .then((updated) => {
      if (updated.success) {
        dispatch(showNotification("success", "Purchase Successful", "Thank you for your purchase. You will receive an email confirming your purchase, your care coordinator will be in touch within 48 hours."));
        dispatch(getCustomerTransactions(true, customer_id));
        dispatch(getStripeExpandedCustomer(true, customer_id));
        dispatch(authenticated.login());
      }
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      return updated;
    })
    .catch((error) => {
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(showNotification("error", "Payment Method Update", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const addPaymentSource = (source, primary) => async (dispatch) => {
  if (source.object !== "token") dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Adding Card..." } });
  return API.post(
    Gateway.name,
    `/stripe/add-payment-source/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        source,
        primary
      }
    })
    .then((updated) => {
      if (updated.success) {
        dispatch({ type: UPDATE_LOGGEDIN_USER, payload: { customer_id: updated.payload.customer.id } });
        if (source.object !== "token") {
          if (primary) dispatch(showNotification("success", "Payment Method Added", "We added your new default payment method to your account."));
          if (!primary) dispatch(showNotification("success", "Payment Method Added", "We added your new payment method to your account."));
        }
        dispatch(getStripeExpandedCustomer(false, updated.payload.customer.id));
        dispatch({ type: GET_ACCOUNT_CUSTOMER, payload: updated.payload });
      }
      if (source.object !== "token") dispatch({ type: SHOW_LOADER, payload: { show: false } });
      return updated;
    })
    .catch((error) => {
      if (source.object !== "token") dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(showNotification("error", "Add Payment Method", (error.response && error.response.data ? error.response.data.message : "Something went wrong.")));
      return { success: false };
    });
};

export const updateAccount = (new_plan, initial_plan, type, external_coupon, should_charge, discounted_total) => async (dispatch) => {
  const account_id = store.getState().session.account_id;
  const primary_account_id = store.getState().session.primary_account_id || account_id;
  const is_switching = store.getState().session.is_switching;
  const current_account = store.getState().accounts.find((account) => account.account_id === account_id);
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Updating Plan..." } });
  return API.post(
    Gateway.name,
    `/stripe/update-subscription-plan/${account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        new_plan,
        initial_plan,
        type,
        external_coupon,
        should_charge,
        discounted_total
      }
    }).then((request) => {
      if (request.success) {
        if (type === "partner") {
          dispatch(updatePartner({ plan_type: new_plan.name }))
            .then(() => {
              if (request.refresh) {
                dispatch(showNotification("success", "Subscription Updated", "Your subscription has been successfully updated."));
                return Auth.currentAuthenticatedUser({ bypassCache: true })
                  .then(async (user) => {
                    const token = user.signInUserSession.idToken.jwtToken;
                    dispatch({ type: CLEAR_ALL });
                    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token, user } });
                    return dispatch(getAccounts(user.username, account_id, true))
                      .then(async (accounts) => {
                        return dispatch(getCurrentUser())
                          .then(async (storedUser) => {
                            dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                            dispatch({ type: IS_SWITCHING, payload: { is_switching, primary_account_id } });
                            dispatch(logEvent("Plan Upgrade", storedUser.payload));
                            if ((account_id !== primary_account_id)) {
                              dispatch({
                                type: SHOW_NOTIFICATION,
                                payload: {
                                  message: `You are viewing ${current_account.first_name} ${current_account.last_name}'s account.`,
                                  type: "info",
                                  action: "BACK_TO_CORE_ACCOUNT",
                                  button_text: "Leave Account",
                                  timeout: null,
                                  hide_close: true,
                                  pages: ["/accounts"]
                                }
                              });
                            } else {
                              dispatch({ type: HIDE_NOTIFICATION });
                            }
                            if (!storedUser.payload.is_partner) dispatch(navigateTo("/"));
                            if (storedUser.payload.is_partner) dispatch(navigateTo("/accounts"));
                            dispatch({ type: SHOW_LOADER, payload: { show: false } });
                            dispatch(logEvent("account subscription updated", store.getState().user));
                            return true;
                          });
                      })
                      .catch((error) => {
                        dispatch({ type: SHOW_LOADER, payload: { show: false } });
                        dispatch(showNotification("error", "Account Update Failed", "Your subscription could not be updated."));
                        return false;
                      });
                  })
                  .catch((error) => {
                    dispatch({ type: SHOW_LOADER, payload: { show: false } });
                    dispatch(showNotification("error", "Account Update Failed", "Your subscription could not be updated."));
                    return false;
                  });
              } else {
                dispatch(showNotification("success", "Subscription cancellation submitted", request.message));
                dispatch({ type: HIDE_LOADER });
                return true;
              }
            });
        } else {
          if (request.refresh) {
            dispatch(showNotification("success", "Subscription Updated", "Your subscription has been successfully updated."));
            return Auth.currentAuthenticatedUser({ bypassCache: true })
              .then(async (user) => {
                const token = user.signInUserSession.idToken.jwtToken;
                dispatch({ type: CLEAR_ALL });
                dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token, user } });
                return dispatch(getAccounts(user.username, account_id, true))
                  .then(async (accounts) => {
                  return dispatch(getCurrentUser())
                    .then(async (storedUser) => {
                      dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                      dispatch({ type: IS_SWITCHING, payload: { is_switching, primary_account_id } });
                      dispatch(logEvent("Plan Upgrade", storedUser.payload));
                      if ((account_id !== primary_account_id)) {
                        dispatch({
                          type: SHOW_NOTIFICATION,
                          payload: {
                            message: `You are viewing ${current_account.first_name} ${current_account.last_name}'s account.`,
                            type: "info",
                            action: "BACK_TO_CORE_ACCOUNT",
                            button_text: "Leave Account",
                            timeout: null,
                            hide_close: true,
                            pages: ["/accounts"]
                          }
                        });
                      } else {
                        dispatch({ type: HIDE_NOTIFICATION });
                      }
                      if (!storedUser.payload.is_partner) dispatch(navigateTo("/"));
                      if (storedUser.payload.is_partner) dispatch(navigateTo("/accounts"));
                      dispatch({ type: SHOW_LOADER, payload: { show: false } });
                      dispatch(logEvent("account subscription updated", store.getState().user));
                      return true;
                    });
                })
                .catch((error) => {
                  dispatch({ type: SHOW_LOADER, payload: { show: false } });
                  dispatch(showNotification("error", "Account Update Failed", "Your subscription could not be updated."));
                  return false;
                });
              })
              .catch((error) => {
                dispatch({ type: SHOW_LOADER, payload: { show: false } });
                dispatch(showNotification("error", "Account Update Failed", "Your subscription could not be updated."));
                return false;
              });
          } else {
            dispatch(showNotification("success", "Subscription cancellation submitted", request.message));
            dispatch({ type: HIDE_LOADER });
            return true;
          }
        }
      } else {
        dispatch({ type: SHOW_LOADER, payload: { show: false } });
        dispatch(showNotification("error", "Account Update Failed", "Your subscription could not be updated."));
        return false;
      }
    }).catch((error) => {
      dispatch({ type: SHOW_LOADER, payload: { show: false } });
      dispatch(showNotification("error", "Account Update Failed", error.response.data.message));
      return false;
    });
};

export const createSubscription = (subscription_config) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/stripe/create-subscription/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: subscription_config
    })
    .then((subscription) => {
      return subscription;
    })
    .catch((error) => {
      dispatch(showNotification("error", "Something went wrong", error.response && error.response.data ? error.response.data.message : "An unknown error occurred."));
      return false;
    });
};

export const verifyDiscount = (code) => async (dispatch) => {
  if (code) {
    return API.post(Gateway.name, "/stripe/verify-discount-code", { body: { code } })
      .then((coupon) => {
        if (coupon.success) {
          LogRocket.track(`Discount verified. - ${coupon.payload.id}`);
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

export const openPaymentMethodsModal = (config) => async (dispatch) => {
  dispatch({ type: OPEN_PAYMENT_METHODS_MODAL, payload: { standalone_payment_methods: config.standalone_payment_methods, show_payment_method_messaging: config.show_payment_method_messaging } });
  dispatch(logEvent("payment-methods", store.getState().user, "modal"));
};

export const closePaymentMethodsModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_PAYMENT_METHODS_MODAL });
};

export const openProfessionalPortalServicesModal = () => async (dispatch) => {
  dispatch({ type: OPEN_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL });
  dispatch(logEvent("additional-services", store.getState().user, "modal"));
};

export const closeProfessionalPortalServicesModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_PROFESSIONAL_PORTAL_ASSISTANCE_MODAL });
};