const { getHeaders, warm } = require("../../../utilities/request");
const deleteNewPaymentSource = require("../../../services/stripe/delete-payment-source");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getExpandedStripeCustomer = require("../../../services/stripe/get-expanded-customer");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { customer_id, account_id } = event.pathParameters;
  const { source_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const deleted = await deleteNewPaymentSource(customer_id, source_id);
    const expanded_customer = await getExpandedStripeCustomer(customer_id);
    if (deleted.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": deleted.message,
          "payload": expanded_customer
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": deleted.message
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};
