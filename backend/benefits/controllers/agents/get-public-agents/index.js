const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const agents = await database.query(`SELECT DISTINCT on (a.config_id)
    a.*,
    u.first_name,
    u.last_name,
    'agent' as type,
    r.name as retailer_name
    from agents a
    JOIN users u on u.cognito_id = a.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = a.cognito_id)
    JOIN retailers r on r.cognito_id = a.parent_id
    where a.status = 'active'
    AND u.status = 'active'
    AND r.status = 'active'`);
  if (agents.length) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched agents",
        "payload": agents
      })
    };
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any agents."
      })
    };
  }
};