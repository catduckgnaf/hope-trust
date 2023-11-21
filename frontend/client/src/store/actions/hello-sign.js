import { API, Auth } from "aws-amplify";
import { UPDATE_SESSION, CLEAR_PARTNER_REGISTRATION, UPDATE_PARTNER_CONVERSION_STATE, UPDATE_PARTNER_REGISTRATION, UPDATE_CONTRACT_STATE, SHOW_LOADER, IS_LOGGED_IN, UPDATE_REQUEST_ID, UPDATE_DOWNLOAD_LINK, CLEAR_ALL } from "../actions/constants";
import { apiGateway, hellosign } from "../../config";
import { store } from "..";
import HelloSign from "hellosign-embedded";
import { getCurrentUser, updateUser } from "./user";
import { navigateTo } from "./navigation";
import { showNotification } from "./notification";
import { createSubscription, updateAccount } from "./stripe";
import { updatePartner, createPartnerReferral, openPartnerLogoModal } from "./partners";
import { getAccounts, updateCoreAccount } from "./account";
import { createHubspotDeal, updateHubspotContact } from "./hubspot";
import { logEvent } from "./utilities";
import { buildHubspotPartnerDealData, buildHubspotPartnerContactData } from "../../utilities";
import { hotjar } from "react-hotjar";
import moment from "moment";
import { isString } from "lodash";
const required_before_referral = ["insurance"];
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

const getClient = (embed_link, allowCancel, element, dispatch) => {
  const client = new HelloSign({ redirectTo: `https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/accounts`, clientId: hellosign.HELLOSIGN_CLIENT_ID, skipDomainVerification: !!process.env.REACT_APP_LOCAL, allowCancel, debug: process.env.REACT_APP_STAGE !== "production", container: document.getElementById(element) });
  client.on("ready", () => {
    dispatch({ type: SHOW_LOADER, payload: { show: false } });
    dispatch({ type: UPDATE_CONTRACT_STATE, payload: { contract_open: true } });
  });
  client.once("cancel", async () => client.close());
  client.on("error", (data) => {
    dispatch(showNotification("error", "Something went wrong", `Please try again. Error code: ${data.code}`));
    client.close();
  });
  client.open(embed_link);
  return client;
};

export const getEmbeddableHelloSignURL = (partner_signature_id, subject, message, signers, templates, partner_config, allowCancel = true, cost, additional_plan_credits, additional_plan_cost, stateSetter) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Building Contract..." } });
  const account_id = store.getState().session.account_id;
  let additional_config = {};
  if (!store.getState().user.customer_id) additional_config.new_customer = { name: `${store.getState().user.first_name} ${store.getState().user.last_name}`, email: store.getState().user.email, phone: store.getState().user.home_phone };
  return API.post(
    Gateway.name,
    `/hello-sign/get-signature-url/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        subject,
        message,
        signers,
        partner_signature_id,
        templates,
        plan_type: partner_config.plan_type,
        is_entity: partner_config.is_entity,
        cost,
        additional_plan_credits,
        additional_plan_cost
      }
    }).then(async (data) => {
      if (data.success) {
        const current_partner = data.payload.partner || store.getState().user.partner_data;
        dispatch({ type: UPDATE_REQUEST_ID, payload: data.payload.request_id });
        const client = getClient(data.payload.embed_link, allowCancel, "contract", dispatch);

        client.on("ready", () => {
          dispatch({ type: SHOW_LOADER, payload: { show: false } });
          dispatch({ type: UPDATE_CONTRACT_STATE, payload: { contract_open: true } });
        });

        client.once("sign", async (data) => {
          dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating subscription" } });
          return dispatch(createSubscription({
            ...additional_config,
            customer_id: store.getState().user.customer_id,
            plan: partner_config.plan,
            failure_plan: store.getState().plans.active_partner_plans.find((p) => p.name === "Free"),
            charge_config: {
              total: partner_config.plan.one_time_fee || (cost * 100),
              line_item_description: `First Month Subscription - ${partner_config.plan.name}`,
              invoice_description: `Hope Trust - ${partner_config.plan.name} Subscription`
            },
            subscription_config: {
              quantity: 0
            },
            type: "partner",
            charge_type: "single-partner"
          }))
            .then(async (transaction) => {
              let additional_properties = [];
              if (transaction.charge_error) {
                dispatch(showNotification("error", "Charge Error", transaction.charge_error));
                dispatch(updatePartner({ plan_type: transaction.payload.plan.name }));
              }
              const current_registration_data = store.getState().partner_registration;
              if (transaction.success && transaction.payload.plan) {
                const plan = transaction.payload.plan;
                const partner_deal_stages = {
                  open: "7439797",
                  won: "8458387",
                  discounted: "7439798",
                  lost: "8458389"
                };
                const discount_valid = current_registration_data.registration_config.discount_code && !isString(current_registration_data.registration_config.discount_code) && current_registration_data.registration_config.discount_code.valid && !plan.coupon;
                let monthly_cost = (plan && plan.monthly) ? plan.monthly : 0;
                const active_coupon = (plan && plan.coupon) ? plan.coupon : ((current_registration_data.registration_config.discount_code && discount_valid) ? current_registration_data.registration_config.discount_code : false);
                const monthly_discount = ((active_coupon && active_coupon.percent_off) ? ((monthly_cost * active_coupon.percent_off) / 100) : (active_coupon.valid && active_coupon.amount_off ? (active_coupon.amount_off/100) : 0));
                const discounted_total = monthly_cost - monthly_discount;
                const plan_total = ((plan.monthly/100) * plan.contract_length_months);
                const total_discount = (((plan.monthly/100) - (discounted_total / 100)) * ((active_coupon && active_coupon.duration === "repeating") ? active_coupon.duration_in_months : (active_coupon && active_coupon.duration === "forever" ? plan.contract_length_months : 0)));
                let dealstage = partner_deal_stages.open; //open
                if (plan.monthly) dealstage = partner_deal_stages.won; //won
                if (plan.monthly && (active_coupon && ["repeating", "forever"].includes(active_coupon.duration))) dealstage = partner_deal_stages.discounted; //discounted
                if (plan.monthly && (active_coupon && ["forever"].includes(active_coupon.duration) && (active_coupon.percent_off && active_coupon.percent_off === 100))) dealstage = partner_deal_stages.lost; //lost
                additional_properties = [
                  { name: "plan_name", value: plan.name },
                  { name: "plan_stripe_id", value: plan.price_id },
                  { name: "stripe_subscription_id", value: transaction.payload.subscription.id },
                  { name: "amount", value: (plan_total - total_discount) },
                  { name: "potential_value", value: active_coupon ? ((plan.monthly/100) * plan.contract_length_months) : 0 },
                  { name: "end_stage", value: (active_coupon && active_coupon.duration === "repeating") ? Math.abs(moment().diff(moment().add(active_coupon.duration_in_months, "months"), "days")) : 0 },
                  { name: "monthly_value", value: (active_coupon && ["repeating", "forever"].includes(active_coupon.duration)) ? ((discounted_total / 100) || (plan.monthly/100)) : (plan.monthly/100) },
                  { name: "potential_monthly_value", value: active_coupon ? (plan.monthly/100) : 0 },
                  { name: "contract_end_date", value: Number(moment().add(transaction.payload.plan.contract_length_months, "months").utc().startOf("date").format("x")) },
                  { name: "contract_end_days", value: Math.abs(moment().diff(moment().add(transaction.payload.plan.contract_length_months, "months"), "days")) },
                  { name: "contract_length_months", value: transaction.payload.plan.contract_length_months },
                  { name: "closed_won_reason", value: plan.monthly ? "Paid Signup" : "" },
                  { name: "hope_trust_account_id", value: store.getState().session.account_id },
                  { name: "dealstage", value: dealstage }
                ];
              }
              const hubspot_data = buildHubspotPartnerDealData(current_registration_data, store.getState().user, additional_properties);
              return dispatch(createHubspotDeal(hubspot_data))
              .then((hubspot_deal) => {
                if (!required_before_referral.includes(current_partner.partner_type) && current_partner.domain_approved && !store.getState().user.coupon) dispatch(createPartnerReferral());
                if (transaction.success && transaction.payload.customer) dispatch(updateUser({ customer_id: transaction.payload.customer.id }));
                if (stateSetter) stateSetter("contracts_signed", true, "registration_config");
                const partner_data = buildHubspotPartnerContactData(current_registration_data, store.getState().multi_part_form.slide, "Done");
                if (transaction.success && transaction.payload.subscription) dispatch(updateCoreAccount({ hubspot_deal_id: hubspot_deal.success ? hubspot_deal.payload.dealId : null, subscription_id: transaction.payload.subscription.id, plan_id: transaction.payload.plan.price_id }));
                dispatch(updateHubspotContact(store.getState().user.hubspot_contact_id, [
                  ...partner_data,
                  { "property": "self_account", "value": true },
                  { "property": "account_role", "value": current_partner.partner_type },
                  { "property": "in_entity", "value": partner_config.is_entity },
                  { "property": "contract_signed", "value": true }
                ]));
                if (process.env.REACT_APP_STAGE === "production") hotjar.event("account registration");
                dispatch({ type: CLEAR_PARTNER_REGISTRATION });
                client.close();
                return { success: true };
              })
              .catch((error) => {
                client.close();
                return { success: false };
              });
            })
            .catch((error) => {
              dispatch(showNotification("error", "Something went wrong", error.response && error.response.data ? error.response.data.message : "An unknown error occurred."));
              client.close();
              return { success: false };
            });
        });

        client.on("close", async (data) => {
          dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Closing Contract..." } });
          dispatch({ type: CLEAR_ALL });
          client.off("sign");
          client.off("ready");
          return Auth.currentAuthenticatedUser({ bypassCache: true })
            .then(async (user) => {
              const token = user.signInUserSession.idToken.jwtToken;
              dispatch({ type: UPDATE_SESSION, payload: { account_id, token, user } });
              return dispatch(getAccounts(user.username, user.username, true))
                .then(async (accounts) => {
                  return dispatch(getCurrentUser(user.username, token))
                    .then(async (storedUser) => {
                      dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                      if (storedUser.payload.partner_data.contract_signed && storedUser.payload.partner_data.is_entity) dispatch(openPartnerLogoModal());
                      dispatch(logEvent("partner contracts", storedUser.payload));
                      if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
                      dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "loading_contracts", value: false } });
                      dispatch(navigateTo("/settings", "?tab=partner-info"));
                      return { success: true };
                    })
                    .catch((error) => {
                      dispatch({ type: SHOW_LOADER, payload: { show: false } });
                      return { success: false };
                    });
                })
                .catch((error) => {
                  dispatch({ type: SHOW_LOADER, payload: { show: false } });
                  return { success: false };
                });
            })
            .catch((error) => {
              dispatch({ type: SHOW_LOADER, payload: { show: false } });
              return { success: false };
            });
        });
      } else {
        if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
        return { success: false };
      }
    }).catch(async (error) => {
      if (error.response && error.response.data) {
        if (error.response.data.message === "This request has already been signed") {
          dispatch(showNotification("error", "Already Signed", error.response.data.message));
        } else {
          dispatch(showNotification("error", "Contract Error", error.response.data.message));
        }
      } else {
        dispatch(showNotification("error", "Something went wrong", "An unknown error occurred."));
      }
      return Auth.currentAuthenticatedUser({ bypassCache: true })
        .then(async (user) => {
          const token = user.signInUserSession.idToken.jwtToken;
          dispatch({ type: UPDATE_SESSION, payload: { account_id, token, user } });
          return dispatch(getAccounts(user.username, user.username, true))
          .then(async (accounts) => {
            return dispatch(getCurrentUser(user.username, token))
              .then(async (storedUser) => {
                dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
                dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "loading_contracts", value: false } });
                dispatch(navigateTo("/accounts"));
                return { success: false };
              })
              .catch((error) => {
                dispatch({ type: SHOW_LOADER, payload: { show: false } });
                if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
                dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "loading_contracts", value: false } });
                return { success: false };
              });
          }).catch((error) => {
            dispatch({ type: SHOW_LOADER, payload: { show: false } });
            if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
            dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "loading_contracts", value: false } });
            return { success: false };
          });
        })
        .catch((error) => {
          dispatch({ type: SHOW_LOADER, payload: { show: false } });
          if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
          dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "loading_contracts", value: false } });
          return { success: false };
        });
    });
};

export const getEmbeddableHelloSignURLResignContracts = (partner_signature_id, subject, message, signers, templates, partner_config, allowCancel = true, cost, additional_plan_credits, additional_plan_cost, initial_plan) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Building Contract..." } });
  const account_id = store.getState().session.account_id;
  let additional_config = {};
  if (!store.getState().user.customer_id) additional_config.new_customer = { name: `${store.getState().user.first_name} ${store.getState().user.last_name}`, email: store.getState().user.email, phone: store.getState().user.home_phone };
  return API.post(
    Gateway.name,
    `/hello-sign/get-signature-url/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        subject,
        message,
        signers,
        partner_signature_id,
        templates,
        plan_type: partner_config.plan_type,
        is_entity: partner_config.is_entity,
        cost,
        additional_plan_credits,
        additional_plan_cost,
        is_upgrade: true
      }
    }).then(async (data) => {
      if (data.success) {
        dispatch({ type: UPDATE_PARTNER_CONVERSION_STATE, payload: { is_updating_plan: true } });
        dispatch({ type: UPDATE_REQUEST_ID, payload: data.payload.request_id });
        const client = getClient(data.payload.embed_link, allowCancel, "contract", dispatch);

        client.once("sign", async (data) => {
          dispatch({ type: UPDATE_PARTNER_CONVERSION_STATE, payload: { is_updating_plan: false } });
          dispatch(updateAccount(partner_config.plan, initial_plan, "partner"))
            .then(async () => {
              client.close();
            })
            .catch(() => {
              client.close();
            });
        });
        client.on("close", async (data) => {
          dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Closing Contract..." } });
          dispatch({ type: CLEAR_ALL });
          client.off("sign");
          client.off("ready");
          return Auth.currentAuthenticatedUser({ bypassCache: true })
            .then(async (user) => {
              const token = user.signInUserSession.idToken.jwtToken;
              dispatch({ type: UPDATE_SESSION, payload: { account_id, token, user } });
              return dispatch(getAccounts(user.username, user.username, true))
                .then(async (accounts) => {
                  return dispatch(getCurrentUser(user.username, token))
                    .then(async (storedUser) => {
                      dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                      dispatch(logEvent("partner contracts", storedUser.payload));
                      dispatch(navigateTo("/accounts"));
                      return { success: true };
                    })
                    .catch((error) => {
                      dispatch({ type: SHOW_LOADER, payload: { show: false } });
                      return { success: false };
                    });
                })
                .catch((error) => {
                  dispatch({ type: SHOW_LOADER, payload: { show: false } });
                  return { success: false };
                });
            })
            .catch((error) => {
              dispatch({ type: SHOW_LOADER, payload: { show: false } });
              return { success: false };
            });
        });
      } else {
        return { success: false };
      }
    }).catch((error) => {
      if (error.response && error.response.data) {
        if (error.response.data.message === "This request has already been signed") {
          dispatch(showNotification("error", "Already Signed", error.response.data.message));
        } else {
          dispatch(showNotification("error", "Contract Error", error.response.data.message));
        }
      } else {
        dispatch(showNotification("error", "Something went wrong", "An unknown error occurred."));
      }
      return Auth.currentAuthenticatedUser({ bypassCache: true })
        .then(async (user) => {
          const token = user.signInUserSession.idToken.jwtToken;
          dispatch({ type: UPDATE_SESSION, payload: { account_id, token, user } });
          return dispatch(getAccounts(user.username, user.username, true))
            .then(async (accounts) => {
              return dispatch(getCurrentUser(user.username, token))
                .then(async (storedUser) => {
                  dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                  dispatch(navigateTo("/accounts"));
                  return { success: false };
                })
                .catch((error) => {
                  dispatch({ type: SHOW_LOADER, payload: { show: false } });
                  return { success: false };
                });
            }).catch((error) => {
              dispatch({ type: SHOW_LOADER, payload: { show: false } });
              return { success: false };
            });
        })
        .catch((error) => {
          dispatch({ type: SHOW_LOADER, payload: { show: false } });
          return { success: false };
        });
    });
};

export const getHelloSignDownloadLink = (request_id) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/hello-sign/get-download-link/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        request_id
      }
    }).then(async (data) => {
      if (data.success) {
        dispatch({ type: UPDATE_DOWNLOAD_LINK, payload: data.payload });
        return { success: true };
      } else {
        return { success: false };
      }
    }).catch((error) => {
      return { success: false };
    });
};