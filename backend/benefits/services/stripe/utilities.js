const Stripe = require(".");

const handleStripeError = (err) => {
  switch (err.type) {
    case "StripeCardError":
      return err.message; // A declined card error
    case "StripeRateLimitError":
      return err.message; // Too many requests made to the API too quickly
    case "StripeInvalidRequestError":
      return err.message; // Invalid parameters were supplied to Stripe's API
    case "StripeAPIError":
      return err.message; // An error occurred internally with Stripe's API
    case "StripeConnectionError":
      return err.message; // Some kind of error occurred during the HTTPS communication
    case "StripeAuthenticationError":
      return err.message; // You probably used an incorrect API key
    default:
      return err.message; // Handle any other types of unexpected errors
  }
};

const generateCodeDigits = () => {
  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let digits = "1234567890";
  let randomString = "";
  for (var i = 0; i < 4; i++) randomString += letters[Math.floor(Math.random() * letters.length)];
  for (var j = 0; j < 4; j++) randomString += digits[Math.floor(Math.random() * digits.length)];
  return randomString;
};

const hasSubscription = (customer) => {
  if (customer && customer.subscriptions && customer.subscriptions.data.length) {
    return { success: true, subscription_id: customer.subscriptions.data[0].id };
  } else {
    return { success: false };
  }
};

const getSubscription = (subscription_id) => {
  return Stripe.subscriptions.retrieve(subscription_id)
    .then((subscription) => {
      return { success: true, response: subscription, message: "Successfully fetched subscription." };
    })
    .catch((error) => {
      return { success: false, message: handleStripeError(error) };
    });
};

const cancelPlanItems = async (subscription_id, clear_usage) => {
  let subscription = await Stripe.subscriptions.retrieve(subscription_id);
  if (subscription) {
    return subscription.items.data.map((item) => {
      return { id: item.id, deleted: true, clear_usage };
    });
  }
};

const getCustomer = (user) => {
  if (!user.customer_id) return { success: false, message: "User is not a Stripe customer." };
  return Stripe.customers.retrieve(user.customer_id)
    .then((customer) => {
      return { success: true, customer };
    })
    .catch((error) => {
      return { success: false, message: handleStripeError(error) };
    });
};

module.exports = { generateCodeDigits, hasSubscription, getSubscription, cancelPlanItems, getCustomer, handleStripeError };