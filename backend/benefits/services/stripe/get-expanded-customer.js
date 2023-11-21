const Stripe = require(".");
const getUsageRecords = require("./get-usage-records");
const { handleStripeError } = require("./utilities");

const getExpandedStripeCustomer = async (customer_id) => {
  return Stripe.customers.retrieve(customer_id, { expand: ["sources", "subscriptions"] })
    .then(async (customer) => {
      let usage = {};
      const subscription_data = customer.subscriptions.data;
      if (subscription_data && subscription_data.length) {
        const subscription_items = subscription_data[0].items.data;
        if (subscription_items.length) usage = await getUsageRecords(subscription_items[0].id, 1);
      }
      let sources = customer.sources;
      if (sources && sources.data.length) sources = { data: sources.data.filter((s) => ["card", "credit"].includes(s.type || s.funding)) };
      return { success: true, customer: { ...customer, sources, usage: usage.success ? usage.response : {} } };
    })
    .catch( (error) => {
      return { success: false, message: handleStripeError(error) };
    });
};

module.exports = getExpandedStripeCustomer;