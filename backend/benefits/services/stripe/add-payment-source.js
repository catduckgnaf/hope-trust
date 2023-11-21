const Stripe = require(".");
const { getCustomer, handleStripeError } = require("./utilities");
const { v1 } = require("uuid");

const addNewPaymentSource = async (user, source, primary = false) => {
  let isCustomer = await getCustomer(user);
  if (!isCustomer.success) return { success: false, message: isCustomer.message };
  return Stripe.customers.createSource(isCustomer.customer.id, { source: source.id }, { idempotencyKey: v1() })
    .then(async () => {
      if (primary) {
        let updatedCustomer = await Stripe.customers.update(isCustomer.customer.id, { default_source: source.id }, { idempotencyKey: v1() });
        if (updatedCustomer.default_source === source.id) return { success: true, message: "New source set as default payment method." };
      }
      return { success: true, message: "New payment method added to customer." };
    })
    .catch((error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = addNewPaymentSource;