const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, group_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const group_approvals = await database.query(`SELECT DISTINCT ON (g.config_id, gc.cognito_id)
    gc.*,
    u.first_name,
    u.last_name,
    u.email,
    g.name as group_name,
    t.name as team_name,
    concat(u.first_name, ' ', u.last_name) as agent_name,
    am.type from group_connections gc
    JOIN users u on u.cognito_id = gc.cognito_id
    LEFT JOIN account_memberships am on am.account_id = gc.cognito_id
    LEFT JOIN groups g on g.config_id = gc.config_id AND g.status = 'active'
    LEFT JOIN teams t on t.cognito_id = gc.cognito_id AND t.status = 'active'
    LEFT JOIN agents a on a.cognito_id = gc.cognito_id AND a.status = 'active'
    where gc.config_id = $3 AND gc.status = ANY($2)
    AND ((am.type = ANY($1) AND am.status = 'active') OR am.type IS NULL)
    AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id)`, ["team", "agent"], ["pending", "active", "declined"], group_id);
    if (group_approvals.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched pending approvals",
          "payload": group_approvals
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not fetch pending approvals."
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
