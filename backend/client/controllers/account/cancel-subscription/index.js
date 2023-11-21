const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const setUsageRecord = require("../../../services/stripe/set-usage-record");
const updateSubscription = require("../../../services/stripe/update-subscription");
const { getSubscription } = require("../../../services/stripe/utilities");
const { updateAccountMembershipPlanPermissions } = require("../../../permissions/helpers");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { orderBy } = require("lodash");
const { capitalize } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { id, subscription_id, partner_customer_id, transfer_customer_id, transfer_cognito_id, free_plan, current_plan } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const oldAccount = await database.queryOne("SELECT * from accounts where subscription_id = $1 AND status = 'active'", subscription_id);
    const updated_subscription = await updateSubscription({ customer_id: transfer_customer_id }, free_plan, current_plan);

    if (updated_subscription.success) {
      const cancelled_subscription = await database.updateById("subscriptions", id, { status: "cancelled" });
      
      if (cancelled_subscription) {
        await Promise.all([
          updateAccountMembershipPlanPermissions(free_plan, oldAccount.account_id, "cancel"),
          database.updateById("accounts", oldAccount.id, { subscription_id: updated_subscription.subscription.id, plan_id: free_plan.price_id }),
          database.insert("subscriptions", { type: "user", customer_id: transfer_customer_id, cognito_id: transfer_cognito_id, subscription_id: updated_subscription.subscription.id, price_id: free_plan.price_id, account_value: (free_plan.monthly / 100), max_cancellations: free_plan.max_cancellations, status: "active" }),
          database.insert("transactions", { type: "subscription", subscription_id, customer_id: transfer_customer_id, price_id: current_plan.price_id, lines: [current_plan.price_id], status: "cancelled", description: "Subscription cancelled by advisor." }),
          database.insert("transactions", { type: "subscription", subscription_id, customer_id: partner_customer_id, price_id: current_plan.price_id, lines: [current_plan.price_id], status: "cancelled", description: "Subscription cancelled by advisor." })
        ]);

        const managed_subscriptions = await database.query("SELECT DISTINCT on (s.subscription_id) s.* from subscriptions s JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active' JOIN users u on u.cognito_id = a.account_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = a.account_id) AND u.status = 'active' where s.customer_id = $1 AND s.status = 'active'", partner_customer_id);
        const partner_subscription = managed_subscriptions.find((s) => s.type === "partner");
        const user_subscriptions = orderBy(managed_subscriptions.filter((s) => s.type === "user"), "created_at");
        const partner_plan = await database.queryOne("SELECT pp.* from partner_plans pp JOIN partners p on p.cognito_id = $2 where pp.price_id = $1 AND pp.type = p.partner_type", partner_subscription.price_id, partner_subscription.cognito_id);

        let total_credits_used = (partner_plan.monthly / 100);
        if (user_subscriptions.length >= partner_plan.seats_included) {
          let additional_accounts = (partner_plan.seats_included - user_subscriptions.length);
          let target_accounts = [];
          if (additional_accounts) target_accounts = user_subscriptions.slice(additional_accounts);
          total_credits_used = target_accounts.reduce((a, b) => a + b.additional_seat_cost, 0) + total_credits_used;
        }
        const current_partner_stripe_subscription = await getSubscription(partner_subscription.subscription_id);
        const partner_subscription_item_id = current_partner_stripe_subscription.response.items.data[0].id;
        if (total_credits_used && partner_subscription_item_id) await setUsageRecord(partner_subscription_item_id, total_credits_used, "set");

        const account_memberships = await database.query("select am.cognito_id, am.permissions, am.linked_account, am.account_id, u.cognito_id, u.email, u.first_name, u.last_name from account_memberships am JOIN users u ON u.cognito_id = am.cognito_id where am.account_id = $1 AND am.status = 'active' AND u.status = 'active'", oldAccount.account_id);
        for (let i = 0; i < account_memberships.length; i++) {
          const membership = account_memberships[i];
          if (!membership.permissions.includes("account-admin-edit")) continue;
          if (membership.permissions.includes("hopetrust-super-admin")) continue;
          if (membership.linked_account) continue;
          await sendTemplateEmail(membership.email, {
            first_name: capitalize(membership.first_name),
            last_name: capitalize(membership.last_name),
            template_type: "account_cancel",
            merge_fields: {
              first_name: capitalize(membership.first_name),
              subject: "Account Downgraded",
              preheader: "Your account has been downgraded to Free"
            }
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully cancelled subscription"
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not cancel subscription."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": updated_subscription.message
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};
