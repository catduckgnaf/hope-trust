const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const products = await database.query(`SELECT
      p.*,
      (SELECT DISTINCT COUNT(*)::int from transactions t where p.price_id = ANY(t.lines) AND t.status = 'succeeded') as count,
      (SELECT DISTINCT string_agg(t.customer_id, ',') from transactions t where p.price_id = ANY(t.lines) AND t.status = 'succeeded') as customers
      from products p`);
    if (products.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched products",
          "payload": products
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch products."
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
