const Stripe = require(".");
const { v1 } = require("uuid");
const { handleStripeError } = require("./utilities");

const createCharge = async (charge_config, customer) => {
  let line_item = {
    customer: customer.id,
    currency: "usd",
    description: charge_config.line_item_description
  };
  if (charge_config.total) line_item.amount = charge_config.total;
  if (charge_config.price_id) line_item.price = charge_config.price_id;
  return Stripe.invoiceItems.create(line_item, { idempotencyKey: v1() })
    .then(async () => {
      let invoice_charge = {
        customer: customer.id,
        collection_method: "charge_automatically",
        auto_advance: true,
        discounts: [],
        description: charge_config.invoice_description
      };
      if (charge_config.coupon && charge_config.coupon.valid && charge_config.coupon.duration === "once") invoice_charge.discounts.push({ coupon: charge_config.coupon.id }); // a discount code was passed through and the discount is meant to apply to a one time charge
      let invoice = await Stripe.invoices.create(invoice_charge, { idempotencyKey: v1() });
      let finalized = await Stripe.invoices.finalizeInvoice(invoice.id, { idempotencyKey: v1() });
      if (!finalized.paid) {
        return Stripe.invoices.pay(invoice.id, { idempotencyKey: v1() })
          .then((paid_invoice) => {
            return { success: true, response: paid_invoice, message: `Invoice #${paid_invoice.id} paid by customer #${customer.id}.` }; // invoice was paid
          })
          .catch((error) => {
            return { success: false, message: handleStripeError(error) };
          });
      }
      return { success: true, response: finalized, message: `Invoice #${invoice.id} paid by customer #${customer.id}.` }; // invoice was finalized and paid.
    })
    .catch((error) => {
      return { success: false, message: handleStripeError(error) };
    });
};

module.exports = createCharge;