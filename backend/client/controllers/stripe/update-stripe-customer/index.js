const { getHeaders, warm } = require("../../../utilities/request");
const updateStripeCustomer = require("../../../services/stripe/update-stripe-customer");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getExpandedStripeCustomer = require("../../../services/stripe/get-expanded-customer");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { customer_id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const updated = await updateStripeCustomer(customer_id, updates);
    const expanded_customer = await getExpandedStripeCustomer(customer_id);
    if (updated.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": updated.message,
          "payload": expanded_customer
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": updated.message
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
