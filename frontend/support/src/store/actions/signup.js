import LogRocket from "logrocket";
import { store } from "..";
import { createTicket  } from "./tickets";
import moment from "moment";
import { updateHubspotDeal, createUserRecord } from "./user";
import {
  customerServiceGetAllUsers,
  customerServiceGetAllAccounts,
  customerServiceGetAllPartners,
  getAllTransactions,
  updateUserRecord
} from "./customer-support";
import { createMembership } from "./membership";
import { showNotification } from "./notification";
import { capitalize } from "../../utilities";
import {
  SHOW_LOADER,
  HIDE_LOADER,
  UPDATE_SIGNUP_STATE,
  CLEAR_SIGNUP_STATE,
  CLOSE_CREATE_ACCOUNT_MODAL
} from "./constants";
import { createClientAccount } from "./account";
import { createSubscription } from "./product";

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
      return dispatch(createSubscription(createdUser, fields, initial_discount, free_plan))
      .then((transaction) => {
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
          return dispatch(createClientAccount(fields, account_info, transaction, created, createdUser))
            .then((newAccount) => {
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
                dispatch(customerServiceGetAllUsers(true));
                dispatch(customerServiceGetAllAccounts(true));
                dispatch(customerServiceGetAllPartners(true));
                dispatch(getAllTransactions(true));
                LogRocket.track(`New account created. - ${newAccount.payload.account_id}`);
                dispatch(createTicket({
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
                return { success: true, account: { ...newAccount.payload, user_plan: (transaction.payload && transaction.payload.subscription) ? transaction.payload.plan : null, subscription_record_id: (transaction.payload && transaction.payload.subscription) ? transaction.payload.subscription.subscription_record_id : null } };
              }
            })
            .catch((error) => {
              dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
            });
        }
      })
      .catch((error) => {
        dispatch(showNotification("error", "Error", (error.response && error.response.data) ? error.response.data.message : error.message));
      });
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