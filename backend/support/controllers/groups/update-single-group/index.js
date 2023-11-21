const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { convertArray } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { group_id, account_id } = event.pathParameters;
  const { update_data } = JSON.parse(event.body);
  const { updates, config_id, old_agent_id, new_agent_id, old_cognito_id, new_cognito_id } = update_data;
  let { group } = updates;
  let { domains = [] } = group;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let is_existing_member = false;
    if (new_cognito_id && !new_agent_id) is_existing_member = await database.queryOne("SELECT id from groups where cognito_id = $1 AND parent_id = $2 AND status = $3", new_cognito_id, old_agent_id, "active");
    if (!new_cognito_id && new_agent_id) is_existing_member = await database.queryOne("SELECT id from groups where cognito_id = $1 AND parent_id = $2 AND status = $3", old_cognito_id, new_agent_id, "active");
    if (new_cognito_id && new_agent_id) is_existing_member = await database.queryOne("SELECT id from groups where cognito_id = $1 AND parent_id = $2 AND status = $3", new_cognito_id, new_agent_id, "active");
    if (!is_existing_member) {
      if (domains && domains.length) updates.group.domains = convertArray(domains);
      if (new_cognito_id && !old_agent_id) updates.group.parent_id = new_cognito_id;
      const updated = Object.keys(updates.group).length ? await database.updateById("groups", group_id, updates.group) : true;
      if (Object.keys(updates.benefits_config).length) await database.updateById("benefits_config", config_id, updates.benefits_config);
      if (updated) {
        if (new_cognito_id) {
          await Promise.all([
            database.update("groups", { cognito_id: new_cognito_id }, { cognito_id: old_cognito_id }), // update agent relationships
            database.update("benefits_config", { cognito_id: new_cognito_id }, { id: config_id }), // update benefits config
            database.update("account_memberships", { cognito_id: new_cognito_id }, { cognito_id: old_cognito_id, status: "active" }) // update account memberships configs config
          ]);
        }
        const record = await database.queryOne(`SELECT DISTINCT on (g.config_id)
          g.*,
          'group' as type,
          g.cognito_id as account_id,
          bc.signature_id,
          bc.signature_request_id,
          bc.contract_signed,
          bc.contract_signed_on,
          bc.logo,
          u.email,
          (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.group_id = g.id AND bcc.status = 'active') as accounts,
          (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.group_id = g.id AND bcc.status = 'active') as count,
          u.first_name,
          u.last_name,
          NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as contact_name
          from groups g
          JOIN benefits_config bc on bc.id = g.config_id
          JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
          where g.id = $1 AND g.status = 'active' AND u.status = 'active'`, group_id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated group record.",
            "payload": record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update group record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Group is already a member of this wholesale agency."
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
