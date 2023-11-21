const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const system_settings = await database.query("SELECT * from system_settings");
  if (system_settings.length) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched system settings.",
        "payload": system_settings[0]
      })
    };
  } else {
    const created = await database.insert("system_settings", { cognito_id: "visitor" });
    if (!created) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create system settings."
        })
      };
    }
    const created_settings = await database.query("SELECT * from system_settings");
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully created system settings.",
        "payload": created_settings[0]
      })
    };
  }
};
