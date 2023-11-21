const Stripe = require(".");
const { handleStripeError } = require("./utilities");

const getUsageRecords = async (subscription_id, limit = 1) => {
  return Stripe.subscriptionItems.listUsageRecordSummaries(subscription_id, { limit })
    .then((usage_records) => {
      return { success: true, response: usage_records, message: "Successfully fetched subscription usage records." };
    })
    .catch((error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = getUsageRecords;