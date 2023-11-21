import { Auth, API } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { logEvent } from "./utilities";
import { store } from "..";
import moment from "moment";
import { getAccounts, getCustomerSubscriptions, getCustomerTransactions } from "./account";
import { createSubscription, getStripeExpandedCustomer } from "./stripe";
import { dispatchRequest } from "./request";
import { formatUSPhoneNumber } from "../../utilities";
import { createAccountUser, getCurrentUser, updateUser } from "./user";
import { updateHubspotDeal } from "./hubspot";
import { openCreateRelationshipModal } from "./relationship";
import { showNotification } from "./notification";
import { generatePassword, capitalize } from "../../utilities";
import { toastr } from "react-redux-toastr";
import { hotjar } from "react-hotjar";
import {
  SHOW_LOADER,
  HIDE_LOADER,
  UPDATE_SIGNUP_STATE,
  CLEAR_SIGNUP_STATE,
  SET_SESSION_ACCOUNT,
  OPEN_CREATE_RELATIONSHIP_MODAL,
  CLEAR_MULTI_PART_FORM,
  CLEAR_CLIENT_REGISTRATION,
  CLOSE_CREATE_ACCOUNT_MODAL,
  IS_REGISTERED
} from "./constants";
import { navigateTo } from "./navigation";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const refresh = (account, update_partner_payload, is_user_creation) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finishing Up" } });
  const current = store.getState().user;
  const session = store.getState().session;
  if (is_user_creation) dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: is_user_creation ? session.account_id : account.account_id, token: session.token, user: session.user } });
  return dispatch(getAccounts(current.cognito_id, session.account_id, true))
  .then(async (accounts) => {
    return dispatch(getCurrentUser())
      .then((storedUser) => {
        const user = storedUser.payload;
        dispatch({ type: IS_REGISTERED, payload: user });
        window.HubSpotConversations.widget.remove();
        return user;
      })
      .then(async (user) => {
        dispatch(logEvent("client account creation", user));
        if (process.env.REACT_APP_STAGE === "production") hotjar.identify(user.cognito_id, { first_name: user.first_name, last_name: user.last_name, email: user.email });
        dispatch({ type: CLEAR_MULTI_PART_FORM });
        dispatch({ type: CLEAR_CLIENT_REGISTRATION });
        dispatch({ type: CLOSE_CREATE_ACCOUNT_MODAL });
        window.HubSpotConversations.widget.remove();
        if (update_partner_payload) dispatch({ type: OPEN_CREATE_RELATIONSHIP_MODAL, payload: update_partner_payload });
        if (user.is_partner) dispatch(navigateTo("/accounts"));
        else dispatch(navigateTo("/"));
        dispatch({ type: HIDE_LOADER });
        return user;
      });
  })
  .catch((error) => {
    dispatch({ type: HIDE_LOADER });
    return { success: false };
  });
};

export const confirmAccountUserSignup = (fields) => async (dispatch) => {
  let account_info = {};
  let update_partner_payload = false;
  let created = fields.beneficiaryDetails;
  let appliedFields = {
    "first_name": created.beneficiaryFirst,
    "middle_name": created.beneficiaryMiddle,
    "last_name": created.beneficiaryLast,
    "email": ((created.beneficiaryEmail).toLowerCase()).replace(/\s+/g, ""),
    "address": created.beneficiaryAddress,
    "address2": created.beneficiaryAddress2,
    "city": created.beneficiaryCity,
    "state": created.beneficiaryState,
    "zip": created.beneficiaryZip,
    "birthday": moment(created.beneficiaryBirthday).format("YYYY-MM-DD"),
    "avatar": created.beneficiaryAvatar,
    "gender": created.beneficiaryGender,
    "pronouns": created.beneficiaryPronouns,
    "hubspot_contact_id": created.hubspot_contact_id
  };
  if ((fields.is_user_creation && fields.user_type === "beneficiary")) appliedFields = store.getState().user;
  let initial_discount = 0;
  if (fields.discountCode && fields.discountCode.duration !== "once") initial_discount = ((fields.discountCode.percent_off ? (((fields.discountCode.percent_off / 100) * fields.plan_choice.monthly)) : (fields.discountCode.amount_off / 100) || 0));
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating subscription" } });
  const free_plan = store.getState().plans.active_user_plans.find((p) => p.name === "Free");
  return dispatch(createSubscription({
    new_customer: {
      phone: created.beneficiaryPhone,
      name: `${appliedFields.first_name} ${appliedFields.last_name}`,
      email: (created.noBeneficiaryEmail && fields.user_type !== "beneficiary") ? (store.getState().user.email).toLowerCase() : (appliedFields.email).toLowerCase(),
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
    customer_id: store.getState().user.customer_id,
    type: "user",
    charge_type: fields.responsibility
  }))
  .then(async (transaction) => {
    if (transaction.success) {
      if (transaction.charge_error) dispatch(showNotification("error", "Charge Error", transaction.charge_error));
      LogRocket.track(`New subscription created. - ${(transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.id : "Subscription ID unknown"}`);
      dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating profile" } });
      const should_create = fields.is_partner_creation || (fields.is_user_creation && fields.user_type !== "beneficiary");
      let newUser = false;
      if (should_create) {
        const create = async () => {
          return dispatch(createAccountUser({
            "newAccountUser": {
              ...appliedFields,
              "customer_id": (transaction.payload && transaction.payload.customer) ? transaction.payload.customer.id : null,
              "status": "active"
            },
            "plan": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan : null,
            "user_type": "beneficiary",
            "account_id": store.getState().session.account_id,
            "sendEmail": created.notifyBeneficiary || false,
            "noEmail": created.noBeneficiaryEmail || false,
            "ignore_membership": true,
            "creator": store.getState().user
          }))
            .then((created) => {
              return created;
            })
            .catch((error) => {
              dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
              return { success: false };
            });
        };
        newUser = await create();
      }
      if ((newUser && newUser.success) || !should_create) {
        const createdUser = newUser.success ? newUser.payload : store.getState().user;
        account_info.creator_id = createdUser.cognito_id;
        account_info.cognito_id = createdUser.cognito_id;
        account_info.first_name = created.beneficiaryFirst;
        account_info.middle_name = created.beneficiaryMiddle;
        account_info.last_name = created.beneficiaryLast;

        LogRocket.track(`New HopeTrust user created. - ${createdUser.first_name} ${createdUser.last_name} - ${createdUser.email}`);
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing account" } });
        const newAccount = await API.post(
          Gateway.name,
          `/accounts/create/${store.getState().user.cognito_id}`,
          {
            headers: {
              Authorization: store.getState().session.token
            },
            body: {
              "account_name": `${account_info.first_name} ${account_info.middle_name ? `${account_info.middle_name} ` : ""}${account_info.last_name}`,
              "beneficiary_id": account_info.cognito_id,
              "cognito_id": account_info.creator_id,
              "account_id": store.getState().session.account_id,
              "plan": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan : null,
              "user_type": "beneficiary",
              "subscription_id": (transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.id : null,
              "discount_code": fields.discountCode || false,
              "referral_code": fields.referral_code || false,
              "hubspot_deal_id": fields.hubspot_deal_id
            }
          });
        if (newAccount.success) {
          const assigned_plan = transaction.payload.plan;
          if (fields.hubspot_deal_id) {
            const user_deal_stages = {
              open: "5652981",
              won: "5652985",
              discounted: "8175797",
              lost: "5652987"
            };
            let dealstage = user_deal_stages.open; //open
            if (assigned_plan.monthly) dealstage = user_deal_stages.won; //won
            if (assigned_plan.monthly && (fields.discountCode && ["repeating", "forever"].includes(fields.discountCode.duration))) dealstage = user_deal_stages.discounted; //discounted
            if (assigned_plan.monthly && (fields.discountCode && ["forever"].includes(fields.discountCode.duration) && (fields.discountCode.percent_off && fields.discountCode.percent_off === 100))) dealstage = user_deal_stages.lost; //lost
            const discounted_total = (assigned_plan.monthly - initial_discount);
            let deal_updates = [
              { name: "dealstage", value: dealstage },
              { name: "amount", value: (discounted_total / 100) },
              { name: "potential_value", value: fields.discountCode ? ((assigned_plan.monthly / 100) * assigned_plan.contract_length_months) : 0 },
              { name: "end_stage", value: (fields.discountCode && fields.discountCode.duration === "repeating") ? Math.abs(moment().diff(moment().add(fields.discountCode.duration_in_months, "months"), "days")) : 0 },
              { name: "monthly_value", value: (fields.discountCode && ["repeating", "forever"].includes(fields.discountCode.duration)) ? ((discounted_total / 100) || (assigned_plan.monthly / 100)) : (assigned_plan.monthly / 100) },
              { name: "potential_monthly_value", value: fields.discountCode ? (assigned_plan.monthly / 100) : 0 },
              { name: "contract_length_months", value: assigned_plan.contract_length_months },
              { name: "plan_name", value: capitalize(assigned_plan.name) },
              { name: "plan_stripe_id", value: assigned_plan.price_id },
              { name: "stripe_subscription_id", value: transaction.payload.subscription.id },
              { name: "closedate", value: Number(moment().utc().startOf("date").format("x")) },
              { name: "contract_end_date", value: Number(moment().add(assigned_plan.contract_length_months, "months").utc().startOf("date").format("x")) },
              { name: "contract_end_days", value: Math.abs(moment().diff(moment().add(assigned_plan.contract_length_months, "months"), "days")) },
              { name: "closed_won_reason", value: "Partner Creation" },
              { name: "hope_trust_account_id", value: newAccount.payload.account_id }
            ];
            dispatch(updateHubspotDeal(fields.hubspot_deal_id, deal_updates));
          }
          if (fields.is_user_creation) dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: newAccount.payload.account_id, primary_account_id: newAccount.payload.account_id } });
          if (fields.is_user_creation && fields.user_type === "beneficiary") dispatch(updateUser({ customer_id: (transaction.payload && transaction.payload.customer) ? transaction.payload.customer.id : null }, false, false));
          dispatch(getCustomerSubscriptions(true, fields.is_user_creation ? transaction.payload.customer.id : store.getState().user.customer_id));
          dispatch(getCustomerTransactions(true, fields.is_user_creation ? transaction.payload.customer.id : store.getState().user.customer_id));
          dispatch(getStripeExpandedCustomer(true, fields.is_user_creation ? transaction.payload.customer.id : store.getState().user.customer_id));
          LogRocket.track(`New account created. - ${newAccount.payload.account_id}`);
          dispatch(dispatchRequest({
            title: "Account Created",
            request_type: "account_update",
            priority: "high",
            status: "new",
            body: `A new account has been created for ${newAccount.payload.account_name}. The account is subscribed to the ${capitalize(assigned_plan.name)} tier at $${assigned_plan.monthly / 100} per month. The account holder can be reached at ${createdUser.email} or ${createdUser.home_phone}`
          }));

          if (fields.is_partner_creation || (fields.referral_code && fields.referral_code.metadata && fields.referral_code.metadata.isReferral === "true")) {
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Linking Advisor" } });
            const link = async () => {
              return API.post(
                Gateway.name,
                `/accounts/associate/${newAccount.payload.account_id}/${store.getState().user.cognito_id}`,
                {
                  headers: {
                    Authorization: store.getState().session.token
                  },
                  body: {
                    referral_code: fields.referral_code.id,
                    discountCode: fields.referral_code,
                    requester: createdUser,
                    approved: fields.is_partner_creation
                  }
                })
                .then(async (linkedAccount) => {
                  return dispatch(getAccounts(store.getState().user.cognito_id, store.getState().session.account_id, true))
                  .then((accounts) => {
                    if (linkedAccount.success) {
                      dispatch(showNotification("success", "Account Linked", `Your new account for ${appliedFields.first_name} was linked to ${linkedAccount.payload.user.first_name} ${linkedAccount.payload.user.last_name}.`));
                      if (store.getState().user.is_partner) {
                        const newUserOptions = {
                          onOk: async () => dispatch(openCreateRelationshipModal({}, false, false, newAccount.payload.account_id, (fields.hubspot_deal_id || false))),
                          onCancel: () => toastr.removeByType("confirms"),
                          okText: "Yes",
                          cancelText: "No"
                        };
                        toastr.confirm("Would you like to add an additional user to this new account? ie: Parent, Guardian", newUserOptions);
                      } else {
                        dispatch(showNotification("success", "Account Linked", `Your account was linked to ${linkedAccount.payload.user.first_name} ${linkedAccount.payload.user.last_name}.`));
                        update_partner_payload = { defaults: { ...linkedAccount.payload.user, linked_referral: true }, updating: true, viewing: false };
                      }
                    }
                    return dispatch(refresh(newAccount.payload, update_partner_payload, fields.is_user_creation));
                  });
                })
                .catch((error) => {
                  dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
                  return { success: false };
                });
            };
            await link();
          }

          if (fields.is_user_creation && fields.user_type !== "beneficiary") {
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Linking User" } });
            const link_user = async () => {
              return API.post(
                Gateway.name,
                `/accounts/link-user-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
                {
                  headers: {
                    Authorization: store.getState().session.token
                  },
                  body: {
                    email: store.getState().user.email,
                    link_to: newAccount.payload.account_id,
                    notify: false,
                    discountCode: fields.referral_code,
                    approved: true,
                    user_type: fields.user_type,
                    linked_account: false
                  }
                })
                .then((link) => {
                  if (link.success) dispatch(showNotification("success", "Account Linked", `Your new account for ${appliedFields.first_name} is now linked and accessible.`));
                  return dispatch(refresh(newAccount.payload, update_partner_payload, fields.is_user_creation));
                })
                .catch((error) => {
                  dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
                  return { success: false };
                });
              };
              await link_user();
          }
          return dispatch(refresh(newAccount.payload, update_partner_payload, fields.is_user_creation));
        }
      }
    }
  })
  .catch((error) => {
    dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
  });
};

export const confirmAccountRegistration = (fields) => async (dispatch) => {
  let account_info = {};
  let update_partner_payload = false;
  let appliedFields = {
    "first_name": fields.first_name,
    "last_name": fields.last_name,
    "email": ((fields.email || "").toLowerCase()).replace(/\s+/g, ""),
    "address": fields.address,
    "address2": fields.address2,
    "city": fields.city,
    "state": fields.state,
    "zip": fields.zip,
    "birthday": moment(fields.birthday).format("YYYY-MM-DD"),
    "gender": fields.gender,
    "pronouns": fields.pronouns,
    "hubspot_contact_id": fields.hubspot_contact_id,
    "home_phone": formatUSPhoneNumber(fields.home_phone),
    "avatar": fields.avatar
  };
  if (!fields.is_benefits) fields.is_benefits = !!store.getState().user.benefits_client_config;
  if (fields.no_email || !appliedFields.email) appliedFields.email = `hopeportalusers+${generatePassword(10)}@gmail.com`;
  if (fields.user_type === "beneficiary") appliedFields = store.getState().user;
  const free_plan = store.getState().plans.active_user_plans.find((p) => p.name === "Free");
  let initial_discount = 0;
  if (fields.discount_code && fields.discount_code.duration !== "once") initial_discount = ((fields.discount_code.percent_off ? (((fields.discount_code.percent_off / 100) * fields.plan_choice.monthly)) : (fields.discount_code.amount_off / 100) || 0));
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating subscription" } });
  let body = {
    plan: fields.is_benefits ? fields.plan_choice : free_plan,
    failure_plan: free_plan,
    charge_config: {
      total: fields.is_benefits ? (fields.plan_choice.one_time_fee || (fields.plan_choice.monthly - initial_discount)) : 0,
      line_item_description: `First Month Subscription - ${fields.is_benefits ? fields.plan_choice.name : free_plan.name}`,
      invoice_description: `Hope Trust - ${fields.is_benefits ? fields.plan_choice.name : free_plan.name} Subscription`,
      coupon: fields.discount_code
    },
    subscription_config: {
      quantity: 0,
      discount_code: fields.discount_code
    },
    customer_id: null,
    type: "user",
    charge_type: fields.is_benefits ? "user" : "client",
    new_customer: {
      phone: (fields.user_type !== "beneficiary" && fields.home_phone) ? appliedFields.home_phone : store.getState().user.home_phone,
      name: `${appliedFields.first_name} ${appliedFields.last_name}`,
      email: ((fields.no_email || !fields.email) && fields.user_type !== "beneficiary") ? (store.getState().user.email).toLowerCase() : (appliedFields.email).toLowerCase(),
      token: fields.token ? fields.token : null
    }
  };
  return dispatch(createSubscription(body))
  .then(async (transaction) => {
    if (transaction.success) {
      if (transaction.charge_error) dispatch(showNotification("error", "Charge Error", transaction.charge_error));
      LogRocket.track(`New subscription created. - ${(transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.id : "Subscription ID unknown"}`);
      dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating profile" } });
      const should_create = fields.user_type !== "beneficiary";
      let newUser = false;
      if (should_create) {
        const create = async () => {
          return dispatch(createAccountUser({
            "newAccountUser": {
              ...appliedFields,
              "customer_id": (transaction.payload && transaction.payload.customer) ? transaction.payload.customer.id : null,
              "status": "active"
            },
            "plan": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan : null,
            "type": "beneficiary",
            "account_id": store.getState().session.account_id,
            "sendEmail": fields.send_email || false,
            "noEmail": fields.no_email || false,
            "ignore_membership": true,
            "creator": store.getState().user
          }))
            .then((created) => {
              return created;
            })
            .catch((error) => {
              dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
              return { success: false };
            });
        };
        newUser = await create();
      }
      if ((newUser && newUser.success) || !should_create) {
        const createdUser = newUser.success ? newUser.payload : store.getState().user;
        account_info.creator_id = createdUser.cognito_id;
        account_info.cognito_id = createdUser.cognito_id;
        account_info.first_name = fields.user_type !== "beneficiary" ? fields.first_name : createdUser.first_name;
        account_info.last_name = fields.user_type !== "beneficiary" ? fields.last_name : createdUser.last_name;

        LogRocket.track(`New HopeTrust user created. - ${createdUser.first_name} ${createdUser.last_name} - ${createdUser.email}`);
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing account" } });
        const newAccount = await API.post(
          Gateway.name,
          `/accounts/create/${store.getState().user.cognito_id}`,
          {
            headers: {
              Authorization: store.getState().session.token
            },
            body: {
              "account_name": `${account_info.first_name} ${account_info.last_name}`,
              "beneficiary_id": account_info.cognito_id,
              "cognito_id": account_info.creator_id,
              "account_id": store.getState().session.account_id,
              "plan": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan : null,
              "user_type": "beneficiary",
              "subscription_id": (transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.id : null,
              "discount_code": fields.discount_code || false,
              "referral_code": fields.referral_code || false,
              "hubspot_deal_id": fields.hubspot_deal_id,
              "invite_code": store.getState().user.benefits_client_config ? store.getState().user.benefits_client_config.invite_code : fields.invite_code || false
            }
          });
        if (newAccount.success) {
          const assigned_plan = transaction.payload.plan;
          if (fields.hubspot_deal_id) {
            const user_deal_stages = {
              open: "5652981",
              won: "5652985",
              discounted: "8175797",
              lost: "5652987"
            };
            let dealstage = user_deal_stages.open; //open
            if (assigned_plan.monthly) dealstage = user_deal_stages.won; //won
            if (assigned_plan.monthly && (fields.discount_code && ["repeating", "forever"].includes(fields.discount_code.duration))) dealstage = user_deal_stages.discounted; //discounted
            if (assigned_plan.monthly && (fields.discount_code && ["forever"].includes(fields.discount_code.duration) && (fields.discount_code.percent_off && fields.discount_code.percent_off === 100))) dealstage = user_deal_stages.lost; //lost
            const discounted_total = (assigned_plan.monthly - initial_discount);
            let deal_updates = [
              { name: "dealstage", value: dealstage },
              { name: "amount", value: (discounted_total / 100) },
              { name: "potential_value", value: fields.discount_code ? ((assigned_plan.monthly / 100) * assigned_plan.contract_length_months) : 0 },
              { name: "end_stage", value: (fields.discount_code && fields.discount_code.duration === "repeating") ? Math.abs(moment().diff(moment().add(fields.discount_code.duration_in_months, "months"), "days")) : 0 },
              { name: "monthly_value", value: (fields.discount_code && ["repeating", "forever"].includes(fields.discount_code.duration)) ? ((discounted_total / 100) || (assigned_plan.monthly / 100)) : (assigned_plan.monthly / 100) },
              { name: "potential_monthly_value", value: fields.discount_code ? (assigned_plan.monthly / 100) : 0 },
              { name: "contract_length_months", value: assigned_plan.contract_length_months },
              { name: "plan_name", value: capitalize(assigned_plan.name) },
              { name: "plan_stripe_id", value: assigned_plan.price_id },
              { name: "stripe_subscription_id", value: transaction.payload.subscription.id },
              { name: "closedate", value: Number(moment().utc().startOf("date").format("x")) },
              { name: "contract_end_date", value: Number(moment().add(assigned_plan.contract_length_months, "months").utc().startOf("date").format("x")) },
              { name: "contract_end_days", value: Math.abs(moment().diff(moment().add(assigned_plan.contract_length_months, "months"), "days")) },
              { name: "closed_won_reason", value: "Employee Benefit" },
              { name: "hope_trust_account_id", value: newAccount.payload.account_id }
            ];
            dispatch(updateHubspotDeal(fields.hubspot_deal_id, deal_updates));
          }
          dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: newAccount.payload.account_id, primary_account_id: newAccount.payload.account_id } });
          if (fields.user_type === "beneficiary") dispatch(updateUser({ customer_id: (transaction.payload && transaction.payload.customer) ? transaction.payload.customer.id : null }, false, false));
          dispatch(getCustomerSubscriptions(true, fields.is_user_creation ? transaction.payload.customer.id : store.getState().user.customer_id));
          dispatch(getCustomerTransactions(true, fields.is_user_creation ? transaction.payload.customer.id : store.getState().user.customer_id));
          dispatch(getStripeExpandedCustomer(true, fields.is_user_creation ? transaction.payload.customer.id : store.getState().user.customer_id));
          LogRocket.track(`New account created. - ${newAccount.payload.account_id}`);
          dispatch(dispatchRequest({
            title: "Account Created",
            request_type: "account_update",
            priority: "high",
            status: "new",
            body: `A new account has been created for ${newAccount.payload.account_name}. The account is subscribed to the ${capitalize(free_plan.name)} tier at $${free_plan.monthly / 100} per month. The account holder can be reached at ${createdUser.email} or ${createdUser.home_phone}`
          }));

          if (fields.referral && fields.referral_valid) {
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Linking Advisor" } });
            const link = async () => {
              return API.post(
                Gateway.name,
                `/accounts/associate/${newAccount.payload.account_id}/${store.getState().user.cognito_id}`,
                {
                  headers: {
                    Authorization: store.getState().session.token
                  },
                  body: {
                    referral_code: fields.referral.id,
                    discountCode: fields.referral,
                    requester: createdUser,
                    approved: fields.is_partner_creation
                  }
                })
                .then(async (linkedAccount) => {
                  if (linkedAccount.success) {
                    dispatch(showNotification("success", "Account Linked", `Your new account for ${appliedFields.first_name} was linked to ${linkedAccount.payload.user.first_name} ${linkedAccount.payload.user.last_name}.`));
                    if (store.getState().user.is_partner) {
                      const newUserOptions = {
                        onOk: async () => dispatch(openCreateRelationshipModal({}, false, false, newAccount.payload.account_id)),
                        onCancel: () => toastr.removeByType("confirms"),
                        okText: "Yes",
                        cancelText: "No"
                      };
                      toastr.confirm("Would you like to add an additional user to this new account? ie: Parent, Guardian", newUserOptions);
                    } else {
                      dispatch(showNotification("success", "Account Linked", `Your account was linked to ${linkedAccount.payload.user.first_name} ${linkedAccount.payload.user.last_name}.`));
                      update_partner_payload = { defaults: { ...linkedAccount.payload.user, linked_referral: true }, updating: true, viewing: false };
                    }
                  }
                  return true;
                })
                .catch((error) => {
                  dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
                  return false;
                });
            };
            await link();
          }

          if (fields.user_type !== "beneficiary") {
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Linking User" } });
            const link_user = async () => {
              return API.post(
                Gateway.name,
                `/accounts/link-user-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
                {
                  headers: {
                    Authorization: store.getState().session.token
                  },
                  body: {
                    email: store.getState().user.email,
                    link_to: newAccount.payload.account_id,
                    notify: false,
                    discountCode: fields.referral,
                    approved: true,
                    user_type: fields.user_type,
                    linked_account: false
                  }
                })
                .then(async (link) => {
                  if (link.success) dispatch(showNotification("success", "Account Linked", `Your new account for ${appliedFields.first_name} is now linked and accessible.`));
                  return true;
                })
                .catch((error) => {
                  dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
                  return false;
                });
            };
            await link_user();
          }
          dispatch(refresh(newAccount.payload, update_partner_payload, true));
          return { success: true };
        } else {
          return { success: false };
        }
      } else {
        return { success: false };
      }
    }
  })
  .catch((error) => {
    dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
  });
};

export const resendSignUp = (email) => async (dispatch) => {
  if (email) {
    email = email.toLowerCase().replace(/\s+/g, "");
    return Auth.resendSignUp((email).toLowerCase())
      .then((data) => {
        LogRocket.track(`Verification code resent to ${email}`);
        dispatch(showNotification("success", "Verification Code Sent", `A new verification code was sent to ${email}`));
        return { success: true };
      })
      .catch((error) => {
        dispatch(showNotification("error", "Resend Verification Code", error.message));
        return { success: false };
      });
  } else {
    dispatch(showNotification("error", "Resend Verification Code", "You must enter an email to resend a verification code."));
    return { success: false };
  }
};

export const changeStep = (step, state) => async (dispatch) => {
  if (!step) {
    dispatch({ type: UPDATE_SIGNUP_STATE, payload: { state } });
  } else {
    dispatch({ type: UPDATE_SIGNUP_STATE, payload: { state, currentStep: step === "forward" ? store.getState().signup.currentStep + 1 : store.getState().signup.currentStep - 1 }}); 
  }
};

export const updateSignupState = (update) => async (dispatch) => {
  dispatch({ type: UPDATE_SIGNUP_STATE, payload: update });
};

export const clearSignupState = () => async (dispatch) => {
  dispatch({ type: CLEAR_SIGNUP_STATE });
};

export const createSignupError = (error, resource) => async (dispatch) => {
  dispatch(showNotification("error", resource, error));
};