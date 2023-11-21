const Stripe = require(".");
const { hasSubscription, getCustomer } = require("./utilities");

const cancelSubscription = async (user) => {
  let isCustomer = await getCustomer(user);
  if (!isCustomer.success) return { success: false, message: isCustomer.message };
  let subscriptionId = await hasSubscription(isCustomer.customer);
  if (!subscriptionId.subscription_id) return { success: false, message: "Customer does not have an active subscription" };
  let response = await Stripe.subscriptions.del(subscriptionId.subscription_id);
  if (response.status === "canceled") return { success: true, message: "Successfully canceled customer subscription" };
  return { success: false, message: "Could not cancel subscription" };
};

module.exports = cancelSubscription;
