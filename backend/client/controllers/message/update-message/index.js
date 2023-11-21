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
      const record = await database.queryOne(`SELECT DISTINCT on (m.id)
        m.*,
        u.first_name as sender_first,
        u.last_name as sender_last,
        NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as sender_name,
        uu.first_name as account_first,
        uu.last_name as account_last,
        NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), '') as account_name,
        uuu.first_name as recipient_user_first,
        uuu.last_name as recipient_user_last,
        COALESCE(NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), ''), m.to_email) as recipient_name,
        CASE
          WHEN (NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), '')) IS NOT NULL then true
        ELSE 
            false
        END as is_user,
        CASE
          WHEN (m.to_cognito IS NOT NULL AND m.to_cognito = m.cognito_id) then 'incoming'
          WHEN (m.to_cognito IS NOT NULL AND m.cognito_id = $2) then 'outgoing'
          WHEN (m.to_cognito IS NULL AND m.to_email IS NOT NULL AND m.cognito_id = $2) then 'outgoing'
        ELSE 
            'incoming'
        END as type
        from messages m
        LEFT JOIN users u on u.cognito_id = m.cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = u.cognito_id)
        LEFT JOIN users uu on uu.cognito_id = m.account_id AND uu.version = (SELECT MAX (version) FROM users where cognito_id = uu.cognito_id)
        LEFT JOIN users uuu on (uuu.cognito_id = m.to_cognito OR uuu.email = m.to_email) AND uuu.version = (SELECT MAX (version) FROM users where cognito_id = uuu.cognito_id)
        WHERE m.id = $1`, updated.id, cognito.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated message record",
          "payload": record
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update message record."
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
