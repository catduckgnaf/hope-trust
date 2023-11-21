const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { updateAccountMembershipPlanPermissions } = require("../../../permissions/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const setUsageRecord = require("../../../services/stripe/set-usage-record");
const updateSubscription = require("../../../services/stripe/update-subscription");
const verifyDiscountCode = require("../../../services/stripe/verify-discount-code");
const updateHubspotDeal = require("../../../services/hubspot/update-hubspot-deal");
const addContactToDeal = require("../../../services/hubspot/add-contact-to-deal");
const { getSubscription } = require("../../../services/stripe/utilities");
const { orderBy, capitalize } = require("lodash");
const moment = require("moment");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { client_account_id, subscription_record_id, customer_id, current_plan, new_plan } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const existing_sponsorship = await database.queryOne(`SELECT
      s.*,
      p.name,
      u.first_name,
      u.last_name
      from subscriptions s
      JOIN users u on u.customer_id = s.customer_id
      JOIN partners p on p.cognito_id = u.cognito_id
      where s.id = $1
      AND p.status = 'active'
      AND u.status = 'active'
      AND s.status = 'active'`, subscription_record_id);
    if (!existing_sponsorship) {
      let requests = [];
      let active_coupon;
      const target_account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", client_account_id);
      const partner = await database.queryOne("SELECT p.*, s.subscription_id, s.additional_seat_cost, s.account_value, pp.additional_plan_credits, pp.seats_included, u.first_name, u.last_name, u.email, u.customer_id, u.cognito_id, u.hubspot_contact_id from partners p JOIN users u on u.cognito_id = p.cognito_id JOIN subscriptions s on s.cognito_id = u.cognito_id AND type = 'partner' JOIN partner_plans pp on pp.price_id = s.price_id where p.status = 'active' AND u.status = 'active' AND s.status = 'active' AND u.customer_id = $1", customer_id);
      const membership = database.queryOne("SELECT referral_code from account_memberships where cognito_id = $1 and account_id = $1 and status = 'active'", partner.cognito_id);
      const user = await database.queryOne("SELECT s.*, u.email, u.first_name, u.last_name, u.customer_id from subscriptions s JOIN users u on u.customer_id = s.customer_id where s.status = 'active' AND u.status = 'active' AND s.id = $1", subscription_record_id);
      const updated = await database.updateById("subscriptions", subscription_record_id, { customer_id, additional_seat_cost: (partner.additional_seat_cost || (new_plan.monthly/100)) });
      if (updated && user && partner) {
        let coupon_features = [];
        if (membership && membership.referral_code) active_coupon = await verifyDiscountCode(membership.referral_code);
        if (active_coupon && active_coupon.success && active_coupon.coupon.valid && active_coupon.coupon.metadata && active_coupon.coupon.metadata.features) coupon_features = active_coupon.coupon.metadata.features.split(",") || [];

        const partner_stripe_subscription = await getSubscription(partner.subscription_id);
        const client_subscription = await getSubscription(user.subscription_id);
        const managed_subscriptions = await database.query("SELECT DISTINCT on (s.subscription_id) s.* from subscriptions s JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active' JOIN users u on u.cognito_id = a.account_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = a.account_id) AND u.status = 'active' where s.customer_id = $1 AND s.status = 'active'", customer_id);
        const user_subscriptions = orderBy(managed_subscriptions.filter((s) => s.type === "user"), "created_at");
        const partner_subscription = managed_subscriptions.find((s) => s.type === "partner");
        let total_credits_used = partner_subscription.account_value;
        const seats_used = user_subscriptions.length;
        const max_seats = partner.seats_included;

        if (current_plan.price_id !== new_plan.price_id) {
          const updated = await updateSubscription(user, new_plan, current_plan, false);
          requests.push(database.updateById("subscriptions", subscription_record_id, { price_id: new_plan.price_id, account_value: (new_plan.monthly/100), additional_seat_cost: partner_subscription.additional_seat_cost || (new_plan.monthly/100) }));
          requests.push(updateAccountMembershipPlanPermissions(new_plan, client_account_id, "upgrade"));
          requests.push(database.updateById("accounts", target_account.id, { plan_id: new_plan.price_id, subscription_id: updated.subscription ? updated.subscription.id : target_account.subscription_id }));
          requests.push(database.insert("transactions", { type: "subscription", customer_id: user.customer_id, price_id: new_plan.price_id, lines: [new_plan.price_id], amount: 0, failure_message: null, status: "succeeded", description: `Subscription successfully upgraded and transferred to ${partner.first_name} ${partner.last_name}` }));
          requests.push(database.insert("transactions", { type: "subscription", customer_id, price_id: new_plan.price_id, lines: [new_plan.price_id], amount: 0, failure_message: null, status: "succeeded", description: `${user.first_name} ${user.last_name}'s subscription was successfully upgraded and transferred to your account.` }));
        } else {
          requests.push(database.updateById("subscriptions", subscription_record_id, { additional_seat_cost: partner_subscription.additional_seat_cost || (new_plan.monthly/100) }));
          requests.push(database.insert("transactions", { type: "subscription", customer_id: user.customer_id, price_id: new_plan.price_id, lines: [new_plan.price_id], amount: 0, failure_message: null, status: "succeeded", description: `Subscription successfully transferred to ${partner.first_name} ${partner.last_name}` }));
          requests.push(database.insert("transactions", { type: "subscription", customer_id, price_id: new_plan.price_id, lines: [new_plan.price_id], amount: 0, failure_message: null, status: "succeeded", description: `${user.first_name} ${user.last_name}'s subscription was successfully transferred to your account.` }));
        }
        if (seats_used > max_seats) {
          const additional_accounts = (max_seats - seats_used);
          let target_accounts = [];
          if (additional_accounts) target_accounts = user_subscriptions.slice(additional_accounts);
          if (partner_stripe_subscription.success) total_credits_used = target_accounts.reduce((a, b) => a + b.additional_seat_cost, 0) + total_credits_used;
        }
        if (partner_stripe_subscription.success) requests.push(setUsageRecord(partner_stripe_subscription.response.items.data[0].id, total_credits_used, "set"));
        if (client_subscription.success) requests.push(setUsageRecord(client_subscription.response.items.data[0].id, 0, "set"));
        requests.push(database.insert("transactions", { type: "add seat", customer_id, price_id: new_plan.price_id, lines: [new_plan.price_id], amount: ((seats_used <= max_seats) ? 0 : ((partner_subscription.additional_seat_cost*100) || new_plan.monthly)), failure_message: null, status: "succeeded", description: "Seat added to partner subscription" }));

        if (coupon_features.length) {
          const features = await database.queryOne("SELECT * from account_features where account_id = $1", client_account_id);
          const current_features = Object.keys(features).filter((item) => !["id", "account_id", "created_at", "updated_at"].includes(item));
          let features_only = {};
          current_features.forEach((feat) => features_only[feat] = features[feat]);
          if (coupon_features.length) coupon_features.forEach((feature) => features_only[feature] = true);
          requests.push(database.updateById("account_features", features.id, { ...features_only }));
        }
        const existing_membership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 and account_id = $2 and status = 'active'", partner.cognito_id, client_account_id);
        if (!existing_membership) {
          await addContactToDeal(partner.hubspot_contact_id, target_account.hubspot_deal_id);
          await database.insert(
            "account_memberships", {
              cognito_id: partner.cognito_id,
              "account_id": client_account_id,
              "permissions": ["basic-user"],
              "status": "active",
              "type": "Linked Account",
              "linked_account": true,
              "approved": true,
              "version": 1
            }
          );
        }

        if (target_account.hubspot_deal_id && (current_plan.price_id !== new_plan.price_id)) {
          let monthly_cost = (new_plan && new_plan.monthly) ? new_plan.monthly : 0;
          let monthly_discount = (active_coupon && (active_coupon.coupon.valid && active_coupon.coupon.percent_off) ? ((monthly_cost * active_coupon.coupon.percent_off) / 100) : ((active_coupon && active_coupon.coupon.valid && active_coupon.coupon.amount_off) ? active_coupon.coupon.amount_off : 0));
          const discounted_total = monthly_cost - monthly_discount;
          const plan_total = ((new_plan.monthly / 100) * new_plan.contract_length_months);
          const total_discount = (((new_plan.monthly / 100) - (discounted_total / 100)) * ((active_coupon && active_coupon.coupon.duration === "repeating") ? active_coupon.coupon.duration_in_months : (active_coupon && active_coupon.coupon.duration === "forever" ? new_plan.contract_length_months : 0)));
          const user_deal_stages = {
            open: "5652981",
            won: "5652985",
            discounted: "8175797",
            lost: "5652987"
          };
          let dealstage = user_deal_stages.open; //open
          if (new_plan.monthly) dealstage = user_deal_stages.won; //won
          if (new_plan.monthly && (active_coupon && ["repeating", "forever"].includes(active_coupon.coupon.duration))) dealstage = user_deal_stages.discounted; //discounted
          if (new_plan.monthly && (active_coupon && ["forever"].includes(active_coupon.coupon.duration) && (active_coupon.coupon.percent_off && active_coupon.coupon.percent_off === 100))) dealstage = user_deal_stages.lost; //lost

          let deal_updates = [
            { name: "dealstage", value: dealstage },
            { name: "amount", value: (plan_total - total_discount) },
            { name: "potential_value", value: active_coupon ? ((new_plan.monthly / 100) * new_plan.contract_length_months) : 0 },
            { name: "end_stage", value: (active_coupon && active_coupon.coupon.duration === "repeating") ? Math.abs(moment().diff(moment().add(active_coupon.coupon.duration_in_months, "months"), "days")) : 0 },
            { name: "monthly_value", value: (active_coupon && ["repeating", "forever"].includes(active_coupon.coupon.duration)) ? ((discounted_total / 100) || (new_plan.monthly / 100)) : (new_plan.monthly / 100) },
            { name: "potential_monthly_value", value: active_coupon ? (new_plan.monthly / 100) : 0 },
            { name: "contract_length_months", value: new_plan.contract_length_months },
            { name: "plan_name", value: capitalize(new_plan.name) },
            { name: "plan_stripe_id", value: new_plan.price_id },
            { name: "stripe_subscription_id", value: target_account.subscription_id },
            { name: "closedate", value: Number(moment().utc().startOf("date").format("x")) },
            { name: "contract_end_date", value: Number(moment().add(new_plan.contract_length_months, "months").utc().startOf("date").format("x")) },
            { name: "contract_end_days", value: Math.abs(moment().diff(moment().add(new_plan.contract_length_months, "months"), "days")) },
            { name: "closed_won_reason", value: "Transfer" },
            { name: "hope_trust_account_id", value: target_account.account_id }
          ];
          await updateHubspotDeal(target_account.hubspot_deal_id, deal_updates);
        }

        requests.push(sendTemplateEmail(user.email, {
          first_name: user.first_name,
          last_name: user.last_name,
          template_type: "subscription_transferred_user",
          merge_fields: {
            first_name: capitalize(user.first_name),
            last_name: capitalize(user.last_name),
            partner_first: capitalize(partner.first_name),
            partner_last: capitalize(partner.last_name),
            partner_email: partner.email,
            organization: partner.name,
            fee: (new_plan.monthly/100),
            login_url: `https://${process.env.STAGE === "production" ? "app" : `${process.env.STAGE}-`}.hopecareplan.com/login`,
            subject: "Subscription Transferred",
            preheader: `${partner.first_name} ${partner.last_name} has taken responsibility for your Hope Trust subscription.`
          }
        }));
        requests.push(sendTemplateEmail(partner.email, {
          first_name: partner.first_name,
          last_name: partner.last_name,
          template_type: "subscription_transferred_partner",
          merge_fields: {
            first_name: capitalize(user.first_name),
            last_name: capitalize(user.last_name),
            partner_first: capitalize(partner.first_name),
            email: user.email,
            fee: (new_plan.monthly/100),
            seats_used,
            max_seats,
            login_url: `https://${process.env.STAGE === "production" ? "app" : `${process.env.STAGE}-`}.hopecareplan.com/login`,
            subject: "Subscription Transferred",
            preheader: `You have taken responsibility for ${user.first_name} ${user.last_name}'s Hope Trust subscription.`
          }
        }));
        await Promise.all(requests);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully transferred subscription.",
            "payload": user
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update subscription record."
        })
      };
    }
    const target_account = await database.queryOne("SELECT a.*, u.* from accounts a JOIN users u on u.cognito_id = a.account_id where a.account_id = $1 AND a.status = 'active' AND u.status = 'active'", client_account_id);
    const partner = await database.queryOne("SELECT p.*, s.subscription_id, s.additional_seat_cost, s.account_value, pp.additional_plan_credits, pp.seats_included, u.first_name, u.last_name, u.email, u.customer_id, u.cognito_id from partners p JOIN users u on u.cognito_id = p.cognito_id JOIN subscriptions s on s.cognito_id = u.cognito_id AND type = 'partner' JOIN partner_plans pp on pp.price_id = s.price_id where p.status = 'active' AND u.status = 'active' AND s.status = 'active' AND u.customer_id = $1", customer_id);
    const existing_membership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 and account_id = $2 and status = 'active'", partner.cognito_id, client_account_id);
    if (existing_membership) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": `Client is already sponsored by ${existing_sponsorship.first_name} ${existing_sponsorship.last_name} from ${existing_sponsorship.name}.`
        })
      };
    }
    await addContactToDeal(partner.hubspot_contact_id, target_account.hubspot_deal_id);
    await database.insert(
      "account_memberships", {
      "cognito_id": partner.cognito_id,
      "account_id": client_account_id,
      "permissions": ["basic-user"],
      "status": "active",
      "type": "Linked Account",
      "approved": true,
      "linked_account": true,
      "version": 1
    }
    );
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": `Successfully linked ${partner.first_name} ${partner.last_name} to ${target_account.first_name} ${target_account.last_name}`,
        "payload": target_account
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
