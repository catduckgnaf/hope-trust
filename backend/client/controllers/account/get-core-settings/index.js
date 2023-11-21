const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const system_settings = await database.queryOne("SELECT * from system_settings");
  if (system_settings) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched system settings.",
        "payload": system_settings
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "Could not fetch system settings."
    })
  };
};
