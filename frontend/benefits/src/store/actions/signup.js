import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { logEvent } from "./utilities";
import { store } from "..";
import { updateCurrentMembership } from "./account";
import { navigateTo } from "./navigation";
import { showNotification } from "./notification";
import { createWholesaler } from "./wholesale";
import { createRetailer } from "./retail";
import { createAgent } from "./agents";
import { createGroup } from "./groups";
import { createTeam } from "./teams";
import { hotjar } from "react-hotjar";
import { dispatchRequest } from "./request";
import moment from "moment";
import { capitalize, sleep } from "../../utilities";
import {
  updateHubspotDeal
} from "./user";
import {
  createUserRecord,
  updateUserRecord,
  createMembership
} from "./customer-support";
import {
  SHOW_LOADER,
  HIDE_LOADER,
  UPDATE_SIGNUP_STATE,
  CLEAR_SIGNUP_STATE,
  SET_SESSION_ACCOUNT,
  CLEAR_MULTI_PART_FORM,
  CLEAR_CLIENT_REGISTRATION,
  IS_REGISTERED,
  OPEN_PARTNER_LOGO_MODAL,
  CLOSE_CREATE_ACCOUNT_MODAL
} from "./constants";

const create_types = {
  "wholesale": createWholesaler,
  "retail": createRetailer,
  "agent": createAgent,
  "group": createGroup,
  "team": createTeam
};

export const refresh = () => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finishing Up" } });
  return API.get(apiGateway.NAME, `/users/${store.getState().user.cognito_id}`, { headers: { Authorization: store.getState().session.token } })
    .then((storedUser) => {
      const user = storedUser.payload;
      dispatch({ type: IS_REGISTERED, payload: user });
      window.HubSpotConversations.widget.remove();
      dispatch(navigateTo("/"));
      return user;
    })
    .then((user) => {
      dispatch({ type: SHOW_LOADER, payload: { show: true, message: `Hello ${user.first_name}.` } });
      dispatch(logEvent("benefits account creation", user));
      if (process.env.REACT_APP_STAGE === "production") hotjar.identify(user.cognito_id, { first_name: user.first_name, last_name: user.last_name, email: user.email });
      dispatch({ type: CLEAR_MULTI_PART_FORM });
      dispatch({ type: CLEAR_CLIENT_REGISTRATION });
      dispatch({ type: HIDE_LOADER });
      return user;
    });
};

export const confirmAccountRegistration = (fields) => async (dispatch) => {
  let account_info = {};
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating profile" } });
  const user = store.getState().user;
  account_info.creator_id = user.cognito_id;
  account_info.cognito_id = user.cognito_id;
  account_info.first_name = user.first_name;
  account_info.last_name = user.last_name;

  LogRocket.track(`New HopeTrust user created. - ${user.first_name} ${user.last_name} - ${user.email}`);
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing account" } });
  let newAccount = { success: true, payload: { account_id: store.getState().user.cognito_id } };
  const addition = fields.account_type === "addition";
  const current_user_domain = user.email.split("@")[1];
  const is_pending = store.getState().user.pending_accounts.length;
  if (!is_pending) {
    newAccount = await API.post(
      apiGateway.NAME,
      `/accounts/create/${store.getState().user.cognito_id}`,
      {
        headers: {
          Authorization: store.getState().session.token
        },
        body: {
          "account_name": fields.name || `${user.first_name} ${user.last_name}`,
          "beneficiary_id": user.cognito_id,
          "cognito_id": user.cognito_id,
          "user_type": fields.user_type,
          "parent_id": fields.parent_id || user.cognito_id,
          addition,
          is_approved_domain: fields.is_approved_domain || fields.valid_domains.includes(current_user_domain)
        }
      });
  }
  if (newAccount.success) {
    const account_id = addition ? fields.parent_id : newAccount.payload.account_id;
    dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, primary_account_id: account_id } });
    if (!addition) {
      let new_account = { parent_id: fields.agent_id || fields.parent_id };
      if (fields.name) new_account.name = fields.name;
      if (fields.valid_domains && fields.valid_domains.length) new_account.domains = fields.valid_domains;
      if (fields.valid_groups && fields.valid_groups.length && ["agent", "team"].includes(fields.user_type)) new_account.groups = fields.valid_groups;
      if (fields.valid_wholesalers && fields.valid_wholesalers.length && ["retail"].includes(fields.user_type)) new_account.wholesalers = fields.valid_wholesalers;
      dispatch(create_types[fields.user_type || store.getState().user.benefits_data.type](new_account, addition))
      .then(async () => {
        dispatch(updateCurrentMembership({ status: "active" }))
        .then(async () => {
          await sleep(2000);
          LogRocket.track(`New account created. - ${account_id}`);
          dispatch(refresh());
          dispatch({ type: OPEN_PARTNER_LOGO_MODAL });
          return { success: true };
        });
      });
    } else {
      LogRocket.track(`New account created. - ${account_id}`);
      dispatch(refresh());
      return { success: true };
    }
  }
};

export const confirmAccountUserSignup = (fields) => async (dispatch) => {
  let account_info = {};
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
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating profile" } });
  return dispatch(createUserRecord(appliedFields, false, true, false, "client"))
    .then(async (newUser) => {
      if ((newUser && newUser.success)) {
        const createdUser = newUser.payload;
        let initial_discount = 0;
        if (fields.discountCode && fields.discountCode.duration !== "once") initial_discount = ((fields.discountCode.percent_off ? (((fields.discountCode.percent_off / 100) * fields.plan_choice.monthly)) : (fields.discountCode.amount_off / 100) || 0));
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating subscription" } });
        const free_plan = store.getState().plans.active_user_plans.find((p) => p.name === "Free");
        const transaction = await API.post(
          apiGateway.NAME,
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
              charge_type: "benefits",
              target_account_id: createdUser.cognito_id,
              cognito_id: createdUser.cognito_id
            }
          });
        if (transaction.success) {
          if (transaction.charge_error) dispatch(showNotification("error", "Charge Error", transaction.charge_error));
          LogRocket.track(`New subscription created. - ${(transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.id : "Subscription ID unknown"}`);
          dispatch(updateUserRecord(createdUser.cognito_id, { status: "active", customer_id: (transaction.payload && transaction.payload.customer) ? transaction.payload.customer.id : null }, "client"));
          account_info.creator_id = createdUser.cognito_id;
          account_info.cognito_id = createdUser.cognito_id;
          account_info.first_name = created.beneficiaryFirst;
          account_info.middle_name = created.beneficiaryMiddle;
          account_info.last_name = created.beneficiaryLast;

          LogRocket.track(`New HopeTrust user created. - ${createdUser.first_name} ${createdUser.last_name} - ${createdUser.email}`);
          dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing account" } });
          const newAccount = await API.post(
            apiGateway.NAME,
            `/clients/create-client-account/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
            {
              headers: {
                Authorization: store.getState().session.token
              },
              body: {
                "account_name": `${account_info.first_name} ${account_info.middle_name ? `${account_info.middle_name} ` : ""}${account_info.last_name}`,
                "cognito_id": account_info.cognito_id,
                "target_account_id": account_info.creator_id,
                "plan_id": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan.price_id : null,
                "subscription_id": (transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.id : null,
                "hubspot_deal_id": fields.hubspot_deal_id,
                "permissions": (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan.permissions : ["basic-user"],
                "sendEmail": (created.notifyBeneficiary ? 1 : 0),
                "noEmail": (created.noBeneficiaryEmail ? 1 : 0),
                createdUser
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
                { name: "closed_won_reason", value: "CS Creation" },
                { name: "hope_trust_account_id", value: newAccount.payload.account_id }
              ];
              dispatch(updateHubspotDeal(fields.hubspot_deal_id, deal_updates));
            }
            const is_referral = (fields.referral_code && fields.referral_code.metadata && fields.referral_code.metadata.isReferral === "true");
            if (is_referral) {
              dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Linking Advisor" } });
              dispatch(createMembership(newAccount.payload.account_id, fields.referral_code.partner.cognito_id, { type: fields.referral_code.partner.partner_type }));
            }
            LogRocket.track(`New account created. - ${newAccount.payload.account_id}`);
            dispatch(dispatchRequest({
              account_id: newAccount.payload.account_id,
              cognito_id: newAccount.payload.account_id,
              title: "Account Created",
              request_type: "account_update",
              priority: "high",
              status: "new",
              body: `A new account has been created for ${newAccount.payload.account_name}. The account is subscribed to the ${capitalize(assigned_plan.name)} tier at $${assigned_plan.monthly / 100} per month. The account holder can be reached at ${createdUser.email} or ${createdUser.home_phone}`
            }));
            dispatch({ type: CLOSE_CREATE_ACCOUNT_MODAL });
            dispatch({ type: HIDE_LOADER });
            return { success: true, user: createdUser, account: { ...newAccount.payload, user_plan: (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan : null, subscription_record_id: (transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.subscription_record_id : null } };
          }
        }
      }
    })
    .catch((error) => {
      dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
    });
};

export const changeStep = (step, state) => async (dispatch) => {
  if (!step) {
    dispatch({ type: UPDATE_SIGNUP_STATE, payload: { state } });
  } else {
    dispatch({ type: UPDATE_SIGNUP_STATE, payload: { state, currentStep: step === "forward" ? store.getState().signup.currentStep + 1 : store.getState().signup.currentStep - 1 } });
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