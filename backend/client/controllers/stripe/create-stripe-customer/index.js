const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const createStripeCustomer = require("../../../services/stripe/create-stripe-customer");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { phone, name, email } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const customer = await createStripeCustomer(phone, name, email);
    if (customer.success) {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
      if (user) await database.updateById("users", user.id, { customer_id: customer.response.id });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": customer.message,
          "payload": customer.response
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
