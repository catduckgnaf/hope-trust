const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newProvider } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const created = await database.insert(
      "account_providers", {
        ...newProvider,
        cognito_id,
        account_id,
        "status": "active"
      }
    );
    if (created) {
      const provider = await database.queryOne(`SELECT
        p.*,
        COALESCE(NULLIF(TRIM(concat_ws(' | ', NULLIF(TRIM(concat_ws(' ', p.contact_first, p.contact_last)), ''), NULLIF(TRIM(p.name), ''))), ''), p.name) as full_name,
        NULLIF(TRIM(concat(p.contact_first, ' ', p.contact_last, ' | ', p.name)), '') as provider_name,
        u.first_name as associated_first,
        u.last_name as associated_last,
        NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as associated_name
        FROM account_providers p
        LEFT JOIN users u on u.cognito_id = p.associated_cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = p.associated_cognito_id AND status = 'active')
        WHERE p.id = $1 AND p.status = 'active'`, created.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new provider.",
          "payload": provider
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new provider."
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
