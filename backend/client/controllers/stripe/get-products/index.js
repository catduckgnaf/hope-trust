const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { category, type, limit, feature, email, cognito_id } = (event && event.queryStringParameters) ? event.queryStringParameters : {};
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let query = "SELECT * from products where status = 'active'";
    if (category) query += ` AND '${category}' = ANY(categories)`;
    if (type) query += ` AND type = '${type}'`;
    if (cognito_id) query += ` AND cognito_id = '${cognito_id}'`;
    if (feature) query += ` AND '${feature}' = ANY(features)`;
    if (email) query += ` AND '${email}' = ANY(contacts)`;
    if (limit) query += ` LIMIT ${limit}`;
    const products = await database.query(query);
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
