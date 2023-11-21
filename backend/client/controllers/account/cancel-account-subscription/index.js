const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const setUsageRecord = require("../../../services/stripe/set-usage-record");
const updateSubscription = require("../../../services/stripe/update-subscription");
const createCharge = require("../../../services/stripe/create-charge");
const deleteSubscriptionDiscount = require("../../../services/stripe/delete-subscription-discount");
const { getSubscription } = require("../../../services/stripe/utilities");
const { updateAccountMembershipPlanPermissions } = require("../../../permissions/helpers");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const updateHubspotDeal = require("../../../services/hubspot/update-hubspot-deal");
const moment = require("moment");
const { capitalize } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const {
    type,
    line_items,
    total,
    coupon,
    free_plan,
    current_plan,
    active_subscription,
    account_customer
  } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const current_account = await database.queryOne("SELECT * from accounts where subscription_id = $1 AND status = 'active'", active_subscription.subscription_id);
    if (total) {
      const charge = await createCharge({
        total,
        line_item_description: `Subscription Cancellation Fee - ${current_plan.name}`,
        invoice_description: `Hope Trust - ${current_plan.name} Subscription Cancellation`,
        coupon
      }, { id: account_customer.customer_id });
      if (!charge.success) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": `Could not charge cancellation fee - ${charge.message}`
          })
        };
      }
    }
    const managed_subscriptions = line_items.filter((l) => l.is_managed);
    if (managed_subscriptions.length) {
      let customer_updates = [];
      for (let i = 0; i < managed_subscriptions.length; i++) customer_updates.push(database.updateById("subscriptions", managed_subscriptions[i].transfer_subscription_id, { additional_seat_cost: managed_subscriptions[i].transfer_account_value, in_transfer: true, status: "active", balance: -(managed_subscriptions[i].transfer_amount * 100) }));
      await Promise.all(customer_updates);
    }
    await deleteSubscriptionDiscount(active_subscription.subscription_id);
    const current_partner_stripe_subscription = await getSubscription(active_subscription.subscription_id);
    const partner_subscription_item_id = current_partner_stripe_subscription.response.items.data[0].id;
    if (partner_subscription_item_id) await setUsageRecord(partner_subscription_item_id, 0, "set");
    const updated_subscription = await updateSubscription({ customer_id: account_customer.customer_id }, free_plan, current_plan);
    if (updated_subscription.success) {
      let updates = [];
      if (type === "partner") updates.push(database.update("partners", { plan_type: free_plan.name }, { cognito_id, status: "active" }));
      updates.push(updateAccountMembershipPlanPermissions(free_plan, current_account.account_id, "cancel")); // update the account users permissions
      updates.push(database.updateById("subscriptions", active_subscription.id, { status: "cancelled" }));
      updates.push(database.updateById("accounts", current_account.id, { subscription_id: updated_subscription.subscription.id, plan_id: free_plan.price_id }));
      updates.push(database.insert("subscriptions", { type, customer_id: account_customer.customer_id, cognito_id, subscription_id: updated_subscription.subscription.id, price_id: free_plan.price_id, account_value: (free_plan.monthly/100), additional_seat_cost: 0, max_cancellations: free_plan.max_cancellations, status: "active" }));
      updates.push(database.insert("transactions", { type: "subscription", subscription_id: current_account.subscription_id, customer_id: account_customer.customer_id, price_id: current_plan.price_id, lines: [current_plan.price_id], status: "cancelled", description: "Subscription cancelled by account holder." }));
      await Promise.all(updates);
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": `Could not update Stripe subscription. - ${updated_subscription.message}`
        })
      };
    }

    if (current_account.hubspot_deal_id) {
      const elapsed_contract_months = moment().diff(moment(active_subscription.created_at), "months");
      const remaining_contract_months = ((current_plan.contract_length_months - 1) - elapsed_contract_months);
      const remaining_cost = (remaining_contract_months > 0) ? (remaining_contract_months * active_subscription.account_value) : 0;
      let deal_updates = [
        { name: "dealstage", value: 5652987 },
        { name: "amount", value: remaining_cost },
        { name: "potential_value", value: 0 },
        { name: "end_stage", value: 0 },
        { name: "monthly_value", value: 0 },
        { name: "potential_monthly_value", value: 0 },
        { name: "contract_length_months", value: 0 },
        { name: "plan_name", value: capitalize(free_plan.name) },
        { name: "plan_stripe_id", value: free_plan.price_id },
        { name: "contract_end_date", value: Number(moment().utc().startOf("date").format("x")) },
        { name: "contract_end_days", value: 0 },
        { name: "closed_lost_reason", value: "Cancellation" }
      ];
      await updateHubspotDeal(current_account.hubspot_deal_id, deal_updates);
    }

    // send emails to account admins
    const account_memberships = await database.query("SELECT am.cognito_id, am.permissions, am.linked_account, am.account_id, u.cognito_id, u.email, u.first_name, u.last_name from account_memberships am JOIN users u ON u.cognito_id = am.cognito_id where am.account_id = $1 AND am.status = 'active' AND u.status = 'active'", current_account.account_id);
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
        "message": "Subscription cancelled successfully."
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
