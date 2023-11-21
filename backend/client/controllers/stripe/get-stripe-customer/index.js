const { getHeaders, warm } = require("../../../utilities/request");
const getExpandedStripeCustomer = require("../../../services/stripe/get-expanded-customer");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, customer_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const customer = await getExpandedStripeCustomer(customer_id);
    if (customer.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": customer.message,
          "payload": customer
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": customer.message
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
