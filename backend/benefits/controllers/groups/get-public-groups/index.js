const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const groups = await database.query(`SELECT
  g.*,
  'group' as type,
  COALESCE((SELECT array_agg(ac.type) from group_connections gc JOIN account_memberships ac ON ac.account_id = gc.cognito_id AND ac.status = 'active' where gc.config_id = g.config_id AND gc.status = 'pending'), '{}') as pending_types,
  COALESCE((SELECT array_agg(ac.type) from group_connections gc JOIN account_memberships ac ON ac.account_id = gc.cognito_id AND ac.status = 'active' where gc.config_id = g.config_id AND gc.status = 'active'), '{}') as approved_types
  from groups g
  where g.status = 'active'`);
  if (groups.length) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched groups",
        "payload": groups
      })
    };
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any groups."
      })
    };
  }
};
