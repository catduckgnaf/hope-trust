const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { convertArray } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { retailer_id, account_id } = event.pathParameters;
  const { update_data } = JSON.parse(event.body);
  const { updates, config_id, old_wholesaler_id, new_wholesaler_id, old_cognito_id, new_cognito_id } = update_data;
  let { retailer } = updates;
  let { domains = [] } = retailer;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let is_existing_member = false;
    if (new_cognito_id && !new_wholesaler_id) is_existing_member = await database.queryOne("SELECT id from retailers where cognito_id = $1 AND parent_id = $2 AND status = 'active'", new_cognito_id, old_wholesaler_id);
    if (!new_cognito_id && new_wholesaler_id) is_existing_member = await database.queryOne("SELECT id from retailers where cognito_id = $1 AND parent_id = $2 AND status = 'active'", old_cognito_id, new_wholesaler_id);
    if (new_cognito_id && new_wholesaler_id) is_existing_member = await database.queryOne("SELECT id from retailers where cognito_id = $1 AND parent_id = $2 AND status = 'active'", new_cognito_id, new_wholesaler_id);
    if (!is_existing_member) {
      if (domains && domains.length) updates.retailer.domains = convertArray(domains);
      const updated = Object.keys(updates.retailer).length ? await database.updateById("retailers", retailer_id, updates.retailer) : true;
      if (Object.keys(updates.benefits_config).length) await database.updateById("benefits_config", config_id, updates.benefits_config);
      if (updated) {
        if (new_cognito_id) {
          await Promise.all([
            database.update("agents", { parent_id: new_cognito_id }, { parent_id: old_cognito_id }), // update agent relationships
            database.update("benefits_config", { cognito_id: new_cognito_id }, { id: config_id }), // update benefits config
            database.update("wholesale_connections", { cognito_id: new_cognito_id }, { cognito_id: old_cognito_id }), // update wholesale connections configs config
            database.update("account_memberships", { cognito_id: new_cognito_id }, { cognito_id: old_cognito_id, status: "active" }) // update account memberships configs config
          ]);
        }
        const record = await database.queryOne(`SELECT DISTINCT on (r.config_id)
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
          where r.id = $1 AND r.status = 'active' AND u.status = 'active'`, retailer_id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated retailer record.",
            "payload": record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update retailer record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Retailer is already a member of this wholesale agency."
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
