const Stripe = require(".");
const moment = require("moment");
const { v1 } = require("uuid");
const { handleStripeError } = require("./utilities");

const setUsageRecord = async (subscription_item_id, quantity, action = "set") => {
  return Stripe.subscriptionItems.createUsageRecord(subscription_item_id, { quantity, timestamp: moment().unix(), action }, { idempotencyKey: v1() })
    .then( (created) => {
      return { success: true, response: created, message: "Successfully updated subscription usage record." };
    })
    .catch( (error) => {
      const error_message = handleStripeError(error);
      return { success: false, message: error_message };
    });
};

module.exports = setUsageRecord;
