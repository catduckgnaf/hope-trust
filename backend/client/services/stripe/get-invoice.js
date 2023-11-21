const Stripe = require(".");
const { handleStripeError } = require("./utilities");

const getInvoice = async (invoice_id) => {
  if (invoice_id) {
    return Stripe.invoices.retrieve(invoice_id)
      .then((price) => {
        return { success: true, response: price, message: "Successfully fetched invoice." };
      })
      .catch((error) => {
        const error_message = handleStripeError(error);
        return { success: false, message: error_message };
      });
  } else {
    return { success: false, message: "Missing required param: Invoice ID" };
  }
};

module.exports = getInvoice;