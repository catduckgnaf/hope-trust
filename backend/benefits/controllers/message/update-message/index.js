const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { message_id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
      const updated = await database.updateById("messages", message_id, updates);
      if (updated) {
        const record = await database.query(`SELECT
        m.*,
        u.first_name as sender_first,
        u.last_name as sender_last,
        uu.first_name as account_first,
        uu.last_name as account_last,
        uuu.first_name as recipient_user_first,
        uuu.last_name as recipient_user_last
        from messages m
        JOIN users u on u.cognito_id = m.cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = u.cognito_id)
        JOIN users uu on uu.cognito_id = m.account_id AND uu.version = (SELECT MAX (version) FROM users where cognito_id = uu.cognito_id)
        LEFT JOIN users uuu on uuu.cognito_id = m.to_cognito AND uuu.version = (SELECT MAX (version) FROM users where cognito_id = uuu.cognito_id)
        where m.id = $1`, message_id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated message record",
            "payload": record[0]
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not update message record."
          })
        };
      }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};