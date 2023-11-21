const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getStripeCustomer = require("../../../services/stripe/get-stripe-customer");
const createStripeCustomer = require("../../../services/stripe/create-stripe-customer");
const createCharge = require("../../../services/stripe/create-charge");
const createSubscription = require("../../../services/stripe/create-subscription");
const setUsageRecord = require("../../../services/stripe/set-usage-record");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const addNewPaymentSource = require("../../../services/stripe/add-payment-source");
const { getSubscription } = require("../../../services/stripe/utilities");
const { updateAccountMembershipPlanPermissions } = require("../../../permissions/helpers");
const { orderBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { new_customer, failure_plan, charge_config, subscription_config, type, charge_type, cognito_id } = JSON.parse(event.body);
  let { plan } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  let charge = false;
  let charge_error = false;
  let created_customer = false;
  let stored_customer = false;
  let charge_customer = false;
  let add_new_source = false;
  let payment_method = { success: true };
  if (cognito.isAuthorized) {
    if (new_customer) {
      created_customer = await createStripeCustomer(new_customer.phone, new_customer.name, new_customer.email);
      const customer_users = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", new_customer.cognito_id, "active");
      if (customer_users.length) await database.updateById("users", customer_users[0].id, { customer_id: created_customer.response.id });
    }
    switch (charge_type) {
      case "benefits":
      case "client":
        stored_customer = created_customer;
        charge_customer = created_customer;
        add_new_source = true;
        break;
      default:
        stored_customer = created_customer;
        charge_customer = created_customer;
        add_new_source = true;
    }
    if (charge_customer && !charge_customer.success) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": charge_customer.message
        })
      };
    } else if (charge_customer.success && add_new_source && (new_customer && new_customer.token)) {
      payment_method = await addNewPaymentSource({ customer_id: charge_customer.response.id }, new_customer.token);
      if (!payment_method.success) {
        charge_error = payment_method.message;
        await database.insert("transactions", { type: "charge", customer_id: charge_customer.response.id, price_id: plan.price_id, lines: [plan.price_id], amount: 0, failure_message: charge_error, status: "failed", description: `Transaction failed: ${charge_error}` });
        plan = failure_plan;
      }
    }
    if (charge_config.total && payment_method.success) {
      charge = await createCharge(charge_config, charge_customer.response);
      if (!charge.success) {
        charge_error = charge.message;
        plan = failure_plan;
      }
    }
    const subscription = await createSubscription(subscription_config, plan, charge_customer.response);
    if (!subscription.success) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": subscription.message
        })
      };
    } else {
      let subscription_item_id = subscription.response.items.data[0].id;
      let total_credits_used = (plan.monthly/100);
      const subscription_record = await database.insert("subscriptions", { type, customer_id: stored_customer.response.id, cognito_id, subscription_id: subscription.response.id, price_id: plan.price_id, account_value: (plan.monthly / 100), additional_seat_cost: (plan.additional_plan_credits || 0), max_cancellations: (plan.max_cancellations || 0), status: "active" });
      if (total_credits_used && subscription.success) await setUsageRecord(subscription_item_id, total_credits_used, "set");

      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created Stripe transaction.",
          "payload": { charge: (charge && charge.success) ? charge.response : false, subscription: { ...subscription.response, subscription_record_id: subscription_record }, customer: charge_customer.response, plan },
          charge_error
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
