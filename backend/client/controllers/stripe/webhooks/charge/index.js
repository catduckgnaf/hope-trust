const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getInvoice = require("../../../../services/stripe/get-invoice");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { stage } = event.queryStringParameters;
  if (event.headers["stripe-signature"]) {
    if (process.env.STAGE === stage) {
      const { data } = JSON.parse(event.body);
      const data_object = data.object;
      let { id, object, amount = 0, customer, status, invoice, receipt_url, hosted_invoice_url, invoice_pdf, failure_message, plan, amount_refunded = 0 } = data_object;
      const related_invoice = await getInvoice(invoice);
      if (["charge", "subscription"].includes(object)) {
        if (amount_refunded) {
          status = `refund_${status}`;
          amount = amount_refunded;
        }
        const transactions = await database.query("SELECT * from transactions where charge_id = $1 AND status = $2", id, status);
        if (!transactions.length || object === "subscription") {
          let description = "";
          if (amount_refunded) description = `Refund ${data_object.status} for customer #${customer} in the amount of $${(amount/100).toFixed(2).toLocaleString()}.`;
          if (object === "charge") description = `Charge ${status} for customer #${customer} in the amount of $${(amount/100).toFixed(2).toLocaleString()}.`;
          if (object === "subscription") description = (amount ? `Subscription renewal ${status} for customer #${customer} in the amount of $${(amount/100).toFixed(2).toLocaleString()}.` : `Subscription created for customer #${customer}.`);
          await database.insert("transactions", {
            customer_id: customer,
            charge_id: object === "charge" ? id : null,
            subscription_id: object === "subscription" ? id : null,
            price_id: plan ? plan.id : null,
            lines: (invoice && related_invoice.success && related_invoice.response.lines.data.length ? related_invoice.response.lines.data.map((l) => l.price.id) : []),
            status,
            amount,
            receipt_url,
            invoice_id: invoice,
            invoice_url: hosted_invoice_url ? hosted_invoice_url : (invoice && related_invoice.success ? related_invoice.response.hosted_invoice_url : null),
            invoice_pdf: invoice_pdf ? invoice_pdf : (invoice && related_invoice.success ? related_invoice.response.invoice_pdf : null),
            failure_message,
            type: amount_refunded ? "refund" : object,
            description
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Transacton created"
          })
        };
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Webhook acknowledged"
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: true,
        message: "Webhook acknowledged incorrect environment."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};

