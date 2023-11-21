const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { convertArray } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { wholesaler_id, account_id } = event.pathParameters;
  let { updates, config_id, old_cognito_id, new_cognito_id } = JSON.parse(event.body);
  let { wholesaler } = updates;
  let { domains = [] } = wholesaler;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (domains && domains.length) updates.wholesaler.domains = convertArray(domains);
    const updated = Object.keys(updates.wholesaler).length ? await database.updateById("wholesalers", wholesaler_id, updates.wholesaler) : true;
    if (Object.keys(updates.benefits_config).length) await database.updateById("benefits_config", config_id, updates.benefits_config);
    if (updated) {
      if (new_cognito_id) {
        await Promise.all([
          database.update("account_memberships", { account_id: new_cognito_id }, { account_id: old_cognito_id, type: "retail" }), // update retail relationships
          database.update("account_memberships", { cognito_id: new_cognito_id }, { cognito_id: old_cognito_id, type: "wholesale" }), // update wholesale relationships
          database.update("benefits_config", { cognito_id: new_cognito_id }, { id: config_id }), // update benefits config
        ]);
      }
      const record = await database.queryOne(`SELECT
        w.*,
        'wholesale' as type,
        w.cognito_id as account_id,
        bc.signature_id,
        bc.signature_request_id,
        bc.contract_signed,
        bc.contract_signed_on,
        bc.logo,
        u.email,
        u.first_name,
        u.last_name from wholesalers w
        JOIN benefits_config bc on bc.id = w.config_id
        JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
        where w.id = $1 AND w.status = 'active' and u.status = 'active'`, wholesaler_id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated wholesaler record",
          "payload": record
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update wholesaler record."
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