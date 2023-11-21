const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { convertArray } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { team_id, account_id } = event.pathParameters;
  const { update_data } = JSON.parse(event.body);
  const { updates, config_id, old_team_id, new_team_id, old_cognito_id, new_cognito_id } = update_data;
  let { team } = updates;
  let { domains = [] } = team;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let is_existing_member = false;
    if (new_cognito_id && !new_team_id) is_existing_member = await database.queryOne("SELECT id from teams where cognito_id = $1 AND parent_id = $2 AND status = 'active'", new_cognito_id, old_team_id);
    if (!new_cognito_id && new_team_id) is_existing_member = await database.queryOne("SELECT id from teams where cognito_id = $1 AND parent_id = $2 AND status = 'active'", old_cognito_id, new_team_id);
    if (new_cognito_id && new_team_id) is_existing_member = await database.queryOne("SELECT id from teams where cognito_id = $1 AND parent_id = $2 AND status = 'active'", new_cognito_id, new_team_id);
    if (!is_existing_member) {
      if (domains && domains.length) updates.team.domains = convertArray(domains);
      const updated = Object.keys(updates.team).length ? await database.updateById("teams", team_id, updates.team) : true;
      if (Object.keys(updates.benefits_config).length) await database.updateById("benefits_config", config_id, updates.benefits_config);
      if (updated) {
        if (new_cognito_id) {
          await Promise.all([
            database.update("benefits_config", { cognito_id: new_cognito_id }, { id: config_id }), // update agent relationships
            database.update("benefits_client_config", { owner_id: new_cognito_id }, { owner_id: old_cognito_id }), // update benefits config
            database.update("group_connections", { cognito_id: new_cognito_id }, { cognito_id: old_cognito_id }), // update wholesale connections configs config
            database.update("account_memberships", { cognito_id: new_cognito_id }, { cognito_id: old_cognito_id, status: "active" }) // update account memberships configs config
          ]);
        }
        const record = await database.queryOne(`SELECT DISTINCT on (t.config_id)
          t.*,
          bc.signature_id,
          bc.signature_request_id,
          bc.contract_signed,
          bc.contract_signed_on,
          bc.logo,
          COALESCE((SELECT array_agg(gc.config_id) from group_connections gc where gc.cognito_id = t.cognito_id AND gc.status = 'pending'), '{}') as pending_groups,
          COALESCE((SELECT array_agg(gc.config_id) from group_connections gc where gc.cognito_id = t.cognito_id AND gc.status = 'active'), '{}') as approved_groups,
          (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.owner_id = t.cognito_id AND bcc.status = 'active') as accounts,
          (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.owner_id = t.cognito_id AND bcc.status = 'active') as count,
          u.email,
          u.first_name,
          u.last_name,
          NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as contact_name
          from teams t
          JOIN benefits_config bc on bc.id = t.config_id
          JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
          where t.id = $1 AND t.status = 'active' AND u.status = 'active'`, team_id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated team record.",
            "payload": record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update team record."
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