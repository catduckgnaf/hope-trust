const Stripe = require(".");
const { handleStripeError } = require("./utilities");

const getCustomer = async (customer_id) => {
  return Stripe.customers.retrieve(customer_id, { expand: ["subscriptions"] })
    .then( (customer) => {
      return { success: true, response: customer, message: "Successfully fetched Stripe customer." };
    })
    .catch( (error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = getCustomer;
