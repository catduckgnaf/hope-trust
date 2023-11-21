const Stripe = require(".");
const { handleStripeError } = require("./utilities");
const { v1 } = require("uuid");

const updateStripeProduct = async (product_id, update_config) => {
  return Stripe.products.update(product_id, update_config,
  { idempotencyKey: v1() })
  .then((product) => {
      return { success: true, response: product, message: "Successfully updated Stripe product." };
    })
    .catch((error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = updateStripeProduct;
