const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const updateSubscription = require("../../../services/stripe/update-subscription");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { updateAccountMembershipPlanPermissions } = require("../../../permissions/helpers");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const setUsageRecord = require("../../../services/stripe/set-usage-record");
const createCharge = require("../../../services/stripe/create-charge");
const verifyDiscountCode = require("../../../services/stripe/verify-discount-code");
const updateHubspotDeal = require("../../../services/hubspot/update-hubspot-deal");
const moment = require("moment");
const { orderBy } = require("lodash");

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  let { new_plan, initial_plan, type, external_coupon = false, should_charge = true, discounted_total = 0 } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const account = cognito.account.find((a) => a.account_id === account_id);
    const creator = account.users.find((user) => user.customer_id && !user.linked_account);
    if (external_coupon) external_coupon = await verifyDiscountCode(external_coupon);
    const active_coupon = (new_plan && new_plan.coupon) ? new_plan.coupon : (external_coupon.success ? external_coupon.coupon : false);
    let coupon_features = [];
    if (active_coupon && active_coupon.metadata && active_coupon.metadata.features) coupon_features = active_coupon.metadata.features.split(",") || [];
    if (creator && creator.customer_id) {
      const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = $2", account_id, "active");
      let updated;
      let total = discounted_total ? discounted_total : ((new_plan && new_plan.monthly) ? new_plan.monthly : 0);
      if (!discounted_total && new_plan && new_plan.coupon) total = (total - (new_plan.coupon.percent_off ? (new_plan.coupon.percent_off * (total / 100)) : (new_plan.coupon.amount_off || 0)));
      if ((new_plan.one_time_fee || total) && initial_plan && should_charge) {
        const charge = await createCharge({
          total: new_plan.one_time_fee || total,
          line_item_description: `First Month Subscription - ${new_plan.name}`,
          invoice_description: `Hope Trust - ${new_plan.name} Subscription`
        }, { id: creator.customer_id });
        if (!charge.success) {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": `Please add a valid payment method to your account and retry your upgrade. - ${charge.message}`
            })
          };
        }
      }
      updated = await updateSubscription(creator, new_plan, initial_plan, (active_coupon ? active_coupon.id : false));
      if (!updated.success) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": updated.message
          })
        };
      }
      const oldAccountUpdated = await database.updateById("accounts", account.id, { "status": "inactive" });
      if (oldAccountUpdated) {
        delete account.id;
        const created = await database.insert(
          "accounts", {
          ...account,
          "plan_id": new_plan.price_id,
          "subscription_id": updated.subscription ? updated.subscription.id : account.subscription_id,
          "status": "active",
          "version": account.version + 1
        }
        );
        if (created) {
          const subscription = await database.queryOne("SELECT * from subscriptions where subscription_id = $1 AND status = 'active'", updated.subscription.id);
          if (subscription) await database.updateById("subscriptions", subscription.id, { status: "inactive", cognito_id: cognito.id });
          await database.insert(
            "subscriptions", {
            subscription_id: updated.subscription.id,
            price_id: new_plan.price_id,
            type,
            customer_id: creator.customer_id,
            account_value: (new_plan.monthly / 100),
            max_cancellations: (subscription.max_cancellations < new_plan.max_cancellations) ? new_plan.max_cancellations : subscription.max_cancellations,
            additional_seat_cost: (subscription.additional_seat_cost && (initial_plan.additional_plan_credits !== subscription.additional_seat_cost)) ? subscription.additional_seat_cost : (new_plan.additional_plan_credits || 0),
            cognito_id: cognito.id,
            status: "active"
          }
          );

          if (type === "partner") {
            let total_credits_used = (new_plan.monthly / 100);
            const managed_subscriptions = await database.query("SELECT DISTINCT on (s.subscription_id) s.* from subscriptions s JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active' JOIN users u on u.cognito_id = a.account_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = a.account_id) AND u.status = 'active' where s.customer_id = $1 AND s.status = 'active'", creator.customer_id);
            const user_subscriptions = orderBy(managed_subscriptions.filter((s) => s.type === "user"), "created_at");
            if (user_subscriptions.length > new_plan.seats_included) {
              let additional_accounts = (new_plan.seats_included - user_subscriptions.length);
              let target_accounts = [];
              if (additional_accounts) target_accounts = user_subscriptions.slice(additional_accounts);
              total_credits_used = target_accounts.reduce((a, b) => a + b.additional_seat_cost, 0) + total_credits_used;
            }
            await setUsageRecord(updated.subscription.items.data[0].id, total_credits_used, "set");
          } else {
            await setUsageRecord(updated.subscription.items.data[0].id, ((new_plan.monthly / 100) || 0), "set");
          }
          await updateAccountMembershipPlanPermissions(new_plan, account_id, "upgrade");

          if (coupon_features.length) {
            const features = await database.queryOne("SELECT * from account_features where account_id = $1", account_id);
            const current_features = Object.keys(features).filter((item) => !["id", "account_id", "created_at", "updated_at"].includes(item));
            let features_only = {};
            current_features.forEach((feat) => features_only[feat] = features[feat]);
            if (coupon_features.length) coupon_features.forEach((feature) => features_only[feature] = true);
            await database.updateById("account_features", features.id, { ...features_only });
          }

          await sendTemplateEmail(creator.email, {
            first_name: capitalize(creator.first_name),
            last_name: capitalize(creator.last_name),
            template_type: "account_update",
            merge_fields: {
              first_name: capitalize(creator.first_name),
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
              new_tier: capitalize(new_plan.name),
              subject: "Account Tier Updated",
              preheader: "Your account tier was successfully updated"
            }
          });
          await database.insert("transactions", { type: "subscription", customer_id: creator.customer_id, price_id: new_plan.price_id, lines: [new_plan.price_id], amount: 0, status: "updated", description: `Subscription updated${initial_plan.name ? ` from ${capitalize(initial_plan.name)} ` : " "}to ${capitalize(new_plan.name)}.` });
          if (account.hubspot_deal_id) {
            const plan_total = ((new_plan.monthly / 100) * new_plan.contract_length_months);
            const total_discount = (((new_plan.monthly / 100) - (discounted_total / 100)) * ((active_coupon && active_coupon.duration === "repeating") ? active_coupon.duration_in_months : (active_coupon && active_coupon.duration === "forever" ? new_plan.contract_length_months : 0)));
            const stages = {
              user_deal_stages: {
                open: "5652981",
                won: "5652985",
                discounted: "8175797",
                lost: "5652987"
              },
              partner_deal_stages: {
                open: "7439797",
                won: "8458387",
                discounted: "7439798",
                lost: "8458389"
              }
            };
            let dealstage = stages[`${type}_deal_stages`].open; //open
            if (new_plan.monthly) dealstage = stages[`${type}_deal_stages`].won; //won
            if (new_plan.monthly && (active_coupon && ["repeating", "forever"].includes(active_coupon.duration))) dealstage = stages[`${type}_deal_stages`].discounted; //discounted
            if (new_plan.monthly && (active_coupon && ["forever"].includes(active_coupon.duration) && (active_coupon.percent_off && active_coupon.percent_off === 100))) dealstage = stages[`${type}_deal_stages`].lost; //lost

            let deal_updates = [
              { name: "dealstage", value: dealstage },
              { name: "amount", value: (plan_total - total_discount) },
              { name: "potential_value", value: active_coupon ? ((new_plan.monthly / 100) * new_plan.contract_length_months) : 0 },
              { name: "end_stage", value: (active_coupon && active_coupon.duration === "repeating") ? Math.abs(moment().diff(moment().add(active_coupon.duration_in_months, "months"), "days")) : 0 },
              { name: "monthly_value", value: (active_coupon && ["repeating", "forever"].includes(active_coupon.duration)) ? ((discounted_total / 100) || (new_plan.monthly / 100)) : (new_plan.monthly / 100) },
              { name: "potential_monthly_value", value: active_coupon ? (new_plan.monthly / 100) : 0 },
              { name: "contract_length_months", value: new_plan.contract_length_months },
              { name: "plan_name", value: capitalize(new_plan.name) },
              { name: "plan_stripe_id", value: new_plan.price_id },
              { name: "stripe_subscription_id", value: updated.subscription.id },
              { name: "closedate", value: Number(moment().utc().startOf("date").format("x")) },
              { name: "contract_end_date", value: Number(moment().add(new_plan.contract_length_months, "months").utc().startOf("date").format("x")) },
              { name: "contract_end_days", value: Math.abs(moment().diff(moment().add(new_plan.contract_length_months, "months"), "days")) },
              { name: "closed_won_reason", value: "Upgrade" },
              { name: "hope_trust_account_id", value: account.account_id }
            ];
            await updateHubspotDeal(account.hubspot_deal_id, deal_updates);
          }
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created new account record",
              "refresh": true
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create new account record."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update account."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find an active customer for this account."
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
