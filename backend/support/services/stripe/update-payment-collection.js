const Stripe = require(".");
const { v1 } = require("uuid");
const { handleStripeError } = require("./utilities");

const updatePaymentCollection = async (subscription_id, collect = false) => {
  let pause_collection = "";
  if (!collect) pause_collection = { behavior: "mark_uncollectible" };
  return Stripe.subscriptions.update(subscription_id, { pause_collection }, { idempotencyKey: v1() })
    .then( (subscription) => {
      return { success: true, subscription };
    })
    .catch( (error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = updatePaymentCollection;
