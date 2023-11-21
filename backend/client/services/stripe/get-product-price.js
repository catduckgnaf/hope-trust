const Stripe = require(".");
const { handleStripeError } = require("./utilities");

const getProductPrice = async (price_id) => {
  return Stripe.prices.retrieve(price_id)
    .then((price) => {
      return { success: true, response: price, message: "Successfully fetched product price." };
    })
    .catch((error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = getProductPrice;