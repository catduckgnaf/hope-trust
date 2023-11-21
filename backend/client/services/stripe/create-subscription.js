const Stripe = require(".");
const { v1 } = require("uuid");
const { handleStripeError } = require("./utilities");

const createSubscription = async (subscription_config, plan, customer) => {
  let item = { price: plan.price_id };
  if (subscription_config.quantity) item.quantity = subscription_config.quantity;
  let charge = {
    collection_method: "charge_automatically",
    customer: customer.id,
    items: [item],
    trial_period_days: plan.billing_days,
    proration_behavior: "create_prorations",
    metadata: {
      original_cost: (plan.monthly/100)
    }
  };
  let coupon;
  if ((plan.coupon && plan.coupon.valid && plan.coupon.duration !== "once")) coupon = plan.coupon.id;
  if (subscription_config.coupon) coupon = subscription_config.coupon;
  if ((subscription_config.discount_code && subscription_config.discount_code.valid && subscription_config.discount_code.duration !== "once")) coupon = subscription_config.discount_code.id;
  if (coupon) charge.coupon = coupon;
  return Stripe.subscriptions.create(charge, { idempotencyKey: v1() })
  .then((subscription) => {
    return { success: true, response: subscription, message: "Subscription successfully created." };
  })
  .catch((error) => {
    return { success: false, message: handleStripeError(error) };
  });
};

module.exports = createSubscription;