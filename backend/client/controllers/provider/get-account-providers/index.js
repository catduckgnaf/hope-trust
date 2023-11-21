const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const providers = await database.query(`SELECT
      p.*,
      CASE
        WHEN p.start = 'Invalid date' then null
      ELSE 
          p.start
      END as start,
      COALESCE(NULLIF(TRIM(concat_ws(' | ', NULLIF(TRIM(concat_ws(' ', p.contact_first, p.contact_last)), ''), NULLIF(TRIM(p.name), ''))), ''), p.name) as full_name,
      NULLIF(TRIM(concat(p.contact_first, ' ', p.contact_last)), '') as provider_name,
      u.first_name as associated_first,
      u.last_name as associated_last,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as associated_name
      FROM account_providers p
      LEFT JOIN users u on u.cognito_id = p.associated_cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = p.associated_cognito_id AND status = 'active')
      WHERE p.account_id = $1 AND p.status = 'active'`, account_id);
    if (providers.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched account providers",
          "payload": providers
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any providers for this account."
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
