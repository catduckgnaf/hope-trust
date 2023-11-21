const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const groups = await database.query(`SELECT DISTINCT on (g.config_id)
      g.*,
      'group' as type,
      g.cognito_id as account_id,
      bc.signature_id,
      bc.signature_request_id,
      bc.contract_signed,
      bc.contract_signed_on,
      bc.logo,
      u.email,
      u.first_name,
      (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.group_id = g.id AND bcc.status = 'active') as accounts,
      (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.group_id = g.id AND bcc.status = 'active') as count,
      u.last_name,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as contact_name
      from groups g
      JOIN benefits_config bc on bc.cognito_id = g.cognito_id
      JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
      where g.status = 'active' AND u.status = 'active'`);
    if (groups.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched groups.",
          "payload": groups
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find groups."
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
