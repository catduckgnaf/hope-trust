const Stripe = require(".");
const { getCustomer } = require("./utilities");
const { handleStripeError } = require("./utilities");

const deleteNewPaymentSource = async (customer_id, source_id) => {
    let isCustomer = await getCustomer({ customer_id });
    if (!isCustomer.success) return { success: false, message: isCustomer.message };
    return Stripe.customers.deleteSource(customer_id, source_id)
    .then((source) => {
        if (source) return { success: true, message: "Source successfully deleted." };
        return { success: false, message: "Something went wrong." };
    })
    .catch((error) => {
        return { success: false, message: handleStripeError(error) };
    });
};

module.exports = deleteNewPaymentSource;