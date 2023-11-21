const Stripe = require(".");
const { handleStripeError } = require("./utilities");

const deleteSubscriptionDiscount = async (subscription_id) => {
  return await Stripe.subscriptions.deleteDiscount(subscription_id)
  .then( (discount) => {
    if (discount.deleted) {
      return { success: true };
    } else {
      return { success: false, message: "We could not delete the discount from this subscription."};
    }
  })
  .catch( (error) => {
    return { success: false, message: handleStripeError(error) };
  });
};

module.exports = deleteSubscriptionDiscount;
