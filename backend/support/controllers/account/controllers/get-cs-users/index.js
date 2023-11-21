const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const all_users = await database.query(`SELECT
      am.*,
      'support' as type,
      u.*,
      concat(u.first_name, ' ', u.last_name) as name
      from account_memberships am
      JOIN users u on u.cognito_id = am.cognito_id AND
      u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = am.cognito_id)
      WHERE am.status = 'active'
      AND am.type = 'customer-support'`);
    if (all_users.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched all CS users",
          "payload": all_users
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch all CS users."
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
