const Stripe = require(".");
const { handleStripeError } = require("./utilities");
const { v1 } = require("uuid");

const createStripeCustomer = async (phone, name, email) => {
  let customer_config = {
    phone,
    name,
    email
  };
  return Stripe.customers.create(customer_config,
  { idempotencyKey: v1() })
  .then((customer) => {
      return { success: true, response: customer, message: "Successfully created Stripe customer." };
    })
    .catch((error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = createStripeCustomer;
