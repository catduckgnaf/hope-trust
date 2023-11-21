const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const setUsageRecord = require("../../../../services/stripe/set-usage-record");
const { getSubscription } = require("../../../../services/stripe/utilities");
const { orderBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  if (event.headers["stripe-signature"]) {
    const { data } = JSON.parse(event.body);
    const { object } = data;
    const { billing_reason, paid, customer, lines, subscription } = object;
    if ((billing_reason === "subscription_cycle" || billing_reason === "subscription_update") && paid) {
      let plan = await database.queryOne("SELECT * from user_plans where price_id = $1 AND status = $2", lines.data[0].price.id, "active");
      if (!plan) plan = await database.queryOne("SELECT * from partner_plans where price_id = $1 AND status = $2", lines.data[0].price.id, "active");
      if (plan) {
        const managed_subscriptions = await database.query("SELECT DISTINCT on (s.subscription_id) s.* from subscriptions s JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active' JOIN users u on u.cognito_id = a.account_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = a.account_id) AND u.status = 'active' where s.customer_id = $1 AND s.status = $2", customer, "active");
        if (managed_subscriptions.length) {
          let total_credits_used = (plan.monthly/100);
          let subscription_id = subscription;
          const user_subscriptions = orderBy(managed_subscriptions.filter((s) => s.type === "user"), "created_at");
          const partner_subscription = managed_subscriptions.find((s) => s.type === "partner");
          if (partner_subscription) {
            subscription_id = partner_subscription.subscription_id;
            if (user_subscriptions.length >= plan.seats_included) {
              let additional_accounts = (plan.seats_included - user_subscriptions.length);
              let target_accounts = [];
              if (additional_accounts) target_accounts = user_subscriptions.slice(additional_accounts);
              total_credits_used = target_accounts.reduce((a, b) => a + b.additional_seat_cost, 0) + total_credits_used;
            }
          }
          const current_stripe_subscription = await getSubscription(subscription_id);
          let subscription_item_id = current_stripe_subscription.response.items.data[0].id;
          if (total_credits_used) await setUsageRecord(subscription_item_id, total_credits_used, "set");
        }
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Subscription renewed."
        })
      };
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Webhook acknowledged"
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};