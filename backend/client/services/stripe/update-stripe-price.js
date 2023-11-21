const Stripe = require(".");
const { handleStripeError } = require("./utilities");
const { v1 } = require("uuid");

const updateStripePrice = async (price_id, update_config) => {
  return Stripe.prices.update(price_id, update_config,
  { idempotencyKey: v1() })
  .then((product) => {
      return { success: true, response: product, message: "Successfully updated Stripe price." };
    })
    .catch((error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = updateStripePrice;
