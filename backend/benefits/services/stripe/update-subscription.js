const Stripe = require(".");
const { hasSubscription, cancelPlanItems, getCustomer } = require("./utilities");
const { v1 } = require("uuid");

const updateSubscription = async (user, plan, initial_plan, external_coupon) => {
  let isCustomer = await getCustomer(user);
  if (isCustomer.success) {
    let isSubscribed = hasSubscription(isCustomer.customer);
    if (isSubscribed.success) {
      let charge = {
        items: [
          {
            plan: plan.price_id
          }
        ],
      };
      if (external_coupon) charge.coupon = external_coupon;
      let canceledPlans = [];
      if (initial_plan) canceledPlans = await cancelPlanItems(isSubscribed.subscription_id, !!(initial_plan.monthly/100));
      charge.billing_cycle_anchor = "unchanged";
      charge.proration_behavior = "none";
      charge.items = [...charge.items, ...canceledPlans];
      return Stripe.subscriptions.update(isSubscribed.subscription_id, charge, { idempotencyKey: v1() })
        .then(async (subscription) => {
          return { success: true, subscription };
        })
        .catch((error) => {
          return { success: false, message: error.message };
        });
    } else {
      return { success: false, message: "Could not update. Customer does not have an active subscription." };
    }
  } else {
    return { success: false, message: isCustomer.message };
  }
};

module.exports = updateSubscription;
