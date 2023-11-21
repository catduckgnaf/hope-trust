const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const agents = await database.query(`SELECT DISTINCT on (a.config_id)
      a.*,
      'agent' as type,
      a.cognito_id as account_id,
      bc.signature_id,
      bc.signature_request_id,
      bc.contract_signed,
      bc.contract_signed_on,
      COALESCE((SELECT array_agg(gc.config_id) from group_connections gc where gc.cognito_id = a.cognito_id AND gc.status = 'pending'), '{}') as pending_groups,
      COALESCE((SELECT array_agg(gc.config_id) from group_connections gc where gc.cognito_id = a.cognito_id AND gc.status = 'active'), '{}') as approved_groups,
      (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.owner_id = a.cognito_id AND bcc.status = 'active') as accounts,
      (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.owner_id = a.cognito_id AND bcc.status = 'active') as count,
      bc.logo,
      u.first_name,
      u.last_name,
      u.email,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as contact_name
      from agents a
      JOIN benefits_config bc on bc.id = a.config_id
      JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
      where a.status = 'active'
      AND u.status = 'active'`);
    if (agents.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched agents.",
          "payload": agents
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find agents."
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