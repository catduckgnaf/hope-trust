const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { default_generic_features } = require("../../../permissions/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  let { newGroup } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (!newGroup.group.parent_id) newGroup.group.parent_id = newGroup.group.cognito_id;
    const record = await database.queryOne("SELECT * from groups where LOWER(name) = $1 AND status = 'active'", newGroup.group.name.toLowerCase());
    if (!record) {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active' AND version = (SELECT MAX (version) FROM users where cognito_id = $1 AND status = 'active')", newGroup.group.cognito_id);
      const created_config = await database.insert("benefits_config", { ...newGroup.benefits_config, cognito_id: newGroup.group.cognito_id });
      const created = await database.insert(
        "groups", {
          ...newGroup.group,
          config_id: created_config.id,
          status: "active"
        }
      );
      await database.insert(
        "accounts", {
          "account_name": `${user.first_name} ${user.last_name}`,
          "cognito_id": user.cognito_id,
          "account_id": user.cognito_id,
          "status": "active",
          "version": 1
        }
      );
      await database.insert("account_features", { ...default_generic_features, account_id: user.cognito_id });
      await database.insert(
        "account_memberships", {
          "cognito_id": user.cognito_id,
          "account_id": user.cognito_id,
          "permissions": ["basic-user", "group", "account-admin-view", "account-admin-edit"],
          "status": "active",
          "primary_contact": true,
          "type": "group",
          "approved": true,
          "version": 1
        }
      );
      if (created) {
        const group_record = await database.queryOne(`SELECT DISTINCT on (g.config_id)
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
          JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = bc.cognito_id AND uu.status = 'active')
          where g.id = $1 AND g.status = 'active' AND u.status = 'active'`, created.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new group record.",
            "payload": group_record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new group record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "An account with this name already exists"
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
