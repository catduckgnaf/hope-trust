const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { capitalize } = require("../../../utilities/helpers");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const setUsageRecord = require("../../../services/stripe/set-usage-record");
const updateStripeCustomer = require("../../../services/stripe/update-stripe-customer");
const { getSubscription } = require("../../../services/stripe/utilities");
const moment = require("moment");
const batch_size = 5;

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  let all_processed = [];
  let emails = [];
  let processing_subscriptions = await database.query(`select
    s.*,
    a.account_name,
    a.account_id,
    u.customer_id AS transfer_customer_id,
    u.cognito_id AS transfer_cognito_id,
    u.email,
    u.first_name,
    u.last_name
    from subscriptions s
    JOIN accounts a ON a.subscription_id = s.subscription_id AND a.status = 'active'
    JOIN account_memberships am ON am.account_id = a.account_id AND am.status = 'active' AND am.linked_account IS NOT TRUE
    JOIN users u ON u.cognito_id = am.cognito_id AND u.status = 'active' AND u.customer_id IS NOT NULL
    where s.in_transfer = true AND s.status = 'active' ORDER BY s.updated_at DESC LIMIT $1`, batch_size);
  if (processing_subscriptions.length) {
    console.log(`Starting processing on batch of ${processing_subscriptions.length} transfers.`);
    for (let i = 0; i < processing_subscriptions.length; i++) {
      console.log(`Transferring subscripton #${i}`);
      const subscription = processing_subscriptions[i];
      const creator = await database.queryOne("SELECT * from users where cognito_id = $1 and status = 'active'", subscription.cognito_id);
      let customer_updates = [];
      const updated_customer = await updateStripeCustomer(subscription.transfer_customer_id, { balance: subscription.balance });
      if (!updated_customer.success) continue;
      customer_updates.push(database.updateById("subscriptions", subscription.id, { in_transfer: false, status: "cancelled", balance: 0 }));
      customer_updates.push(database.insert("subscriptions", { type: "user", customer_id: subscription.transfer_customer_id, cognito_id: subscription.transfer_cognito_id, subscription_id: subscription.subscription_id, price_id: subscription.price_id, account_value: subscription.account_value, max_cancellations: 0, status: "active", additional_seat_cost: subscription.account_value }));
      customer_updates.push(database.insert("transactions", { type: "subscription", subscription_id: subscription.subscription_id, customer_id: subscription.transfer_customer_id, price_id: subscription.price_id, lines: [subscription.price_id], status: "transferred", description: `Subscription transferred by ${creator.first_name} ${creator.last_name}.` }));
      customer_updates.push(database.insert("transactions", { type: "subscription", subscription_id: subscription.subscription_id, customer_id: subscription.customer_id, price_id: subscription.price_id, lines: [subscription.price_id], status: "cancelled", description: "Subscription cancelled by account holder." }));
      const current_stripe_subscription = await getSubscription(subscription.subscription_id);
      if (current_stripe_subscription.success) {
        const subscription_item_id = current_stripe_subscription.response.items.data[0].id;
        if (subscription_item_id) customer_updates.push(setUsageRecord(subscription_item_id, subscription.account_value, "set"));
      }
      await Promise.all(customer_updates);
      if (!subscription.email.includes("hopeportalusers+")) {
        emails.push(sendTemplateEmail(subscription.email, {
          first_name: capitalize(subscription.first_name),
          last_name: capitalize(subscription.last_name),
          template_type: "subscription_transferred",
          merge_fields: {
            creator_first: creator.first_name,
            creator_last: creator.last_name,
            subscription_cost: `$${subscription.account_value}`,
            balance: `$${(Math.abs(subscription.balance) / 100).toLocaleString()}`,
            covered_months: ((Math.abs(subscription.balance) / 100) / subscription.account_value),
            first_name: capitalize(subscription.first_name),
            first_payment: moment().add(((Math.abs(subscription.balance) / 100) / subscription.account_value), "month").format("MMMM YYYY"),
            login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
            subject: "Your subscription has been successfully transferred",
            preheader: "Your Hope Trust partner has transferred a subscription to you."
          }
        }));
      }
      all_processed.push(subscription.id);
    }
    if (emails.length) await Promise.all(emails);
    return {
      statusCode: 200,
      headers: getHeaders(),
      message: `${all_processed.length} transfers processed. ${processing_subscriptions.length - all_processed.length} subscriptions remaining in transfer queue.`
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    message: "No subscriptions in transfer queue. Exiting early."
  };
};

