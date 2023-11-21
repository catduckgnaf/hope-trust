const Stripe = require(".");
const { handleStripeError } = require("./utilities");
const { v1 } = require("uuid");

const createStripePrice = async (title, amount, slug, status, product_id) => {
  let price_config = {
    currency: "usd",
    active: status === "active",
    nickname: `${title} - $${amount/100}`,
    unit_amount: amount,
    billing_scheme: "per_unit",
    lookup_key: slug
  };
  if (!product_id) price_config.product_data = { name: title, active: true, unit_label: "unit"};
  if (product_id) price_config.product = product_id;
  return Stripe.prices.create(price_config,
  { idempotencyKey: v1() })
  .then((product) => {
      return { success: true, response: product, message: "Successfully created Stripe product." };
    })
    .catch((error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = createStripePrice;
