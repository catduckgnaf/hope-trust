const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const retailers = await database.query(`SELECT DISTINCT on (r.name)
  r.*,
  'retail' as type,
  COALESCE((SELECT array_agg(wc.config_id) from wholesale_connections wc where wc.cognito_id = r.cognito_id AND wc.status = 'active'), '{}') as approved_wholesalers
  from retailers r
  where r.status = 'active'`);
  if (retailers.length) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched retailers",
        "payload": retailers
      })
    };
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any retailers."
      })
    };
  }
};
