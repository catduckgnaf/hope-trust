const Stripe = require(".");
const { getCustomer } = require("./utilities");
const { v1 } = require("uuid");
const { handleStripeError } = require("./utilities");

const updateStripeCustomer = async (customer_id, updates) => {
    let isCustomer = await getCustomer({ customer_id });
    if (!isCustomer.success) return { success: false, message: isCustomer.message };
    return Stripe.customers.update(customer_id, updates, { idempotencyKey: v1() })
    .then((updated) => {
        if (updated) return { success: true, message: "Customer successfully updated." };
        return { success: false, message: "Something went wrong." };
    })
    .catch((error) => {
        return { success: false, message: handleStripeError(error) };
    });
};

module.exports = updateStripeCustomer;