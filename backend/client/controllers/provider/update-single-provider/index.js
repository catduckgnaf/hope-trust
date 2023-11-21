const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { provider_id, account_id } = event.pathParameters;
  const { newProvider } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const updated = await database.updateById("account_providers", provider_id, newProvider);
    if (updated) {
      const provider = await database.queryOne(`SELECT
        p.*,
        COALESCE(NULLIF(TRIM(concat_ws(' | ', NULLIF(TRIM(concat_ws(' ', p.contact_first, p.contact_last)), ''), NULLIF(TRIM(p.name), ''))), ''), p.name) as full_name,
        NULLIF(TRIM(concat(p.contact_first, ' ', p.contact_last, ' | ', p.name)), '') as provider_name,
        u.first_name as associated_first,
        u.last_name as associated_last,
        NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as associated_name
        FROM account_providers p
        LEFT JOIN users u on u.cognito_id = p.associated_cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = p.associated_cognito_id AND status = 'active')
        WHERE p.id = $1 AND p.status = 'active'`, updated.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated provider record",
          "payload": provider
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update provider record."
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
