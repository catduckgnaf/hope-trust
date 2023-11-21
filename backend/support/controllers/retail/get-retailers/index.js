const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const retailers = await database.query(`SELECT DISTINCT on (r.config_id)
      r.*,
      'retail' as type,
      r.cognito_id as account_id,
      bc.signature_id,
      bc.signature_request_id,
      bc.contract_signed,
      bc.contract_signed_on,
      bc.logo,
      u.email,
      u.first_name,
      u.last_name,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as contact_name,
      COALESCE((SELECT array_agg(wc.config_id) from wholesale_connections wc where wc.cognito_id = r.cognito_id AND wc.status = 'pending'), '{}') as pending_wholesalers,
      COALESCE((SELECT array_agg(wc.config_id) from wholesale_connections wc where wc.cognito_id = r.cognito_id AND wc.status = 'active'), '{}') as approved_wholesalers
      from retailers r
      JOIN benefits_config bc on bc.id = r.config_id
      JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
      where r.status = 'active'
      AND u.status = 'active'`);
    if (retailers.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched retailers.",
          "payload": retailers
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find retailers."
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
