const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const data = await database.query(`SELECT DISTINCT on (m.id)
      m.*,
      u.first_name as sender_first,
      u.last_name as sender_last,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as sender_name,
      uu.first_name as account_first,
      uu.last_name as account_last,
      NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), '') as account_name,
      uuu.first_name as recipient_user_first,
      uuu.last_name as recipient_user_last,
      NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), '') as recipient_name
      from messages m
      LEFT JOIN users u on u.cognito_id = m.cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = u.cognito_id)
      LEFT JOIN users uu on uu.cognito_id = m.account_id AND uu.version = (SELECT MAX (version) FROM users where cognito_id = uu.cognito_id)
      LEFT JOIN users uuu on (uuu.cognito_id = m.to_cognito OR uuu.email = m.to_email) AND uuu.version = (SELECT MAX (version) FROM users where cognito_id = uuu.cognito_id)`);
    if (data.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched messages.",
          "payload": data
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find messages."
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
