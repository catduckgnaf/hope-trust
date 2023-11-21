const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { isThirdPartyAuthorized } = require("../../../../permissions/helpers.js");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { app_name } = event.queryStringParameters;
  if (isThirdPartyAuthorized(event, "BUDDY")) {
    const settings = await database.queryOne("SELECT * from system_settings");
    if (settings) {
      const new_version = (settings[`${app_name}_app_version`] + 0.01).toFixed(2);
      const updated = await database.updateById("system_settings", settings.id, { [`${app_name}_app_version`]: new_version });
      if (updated) {
        console.log(`${process.env.STAGE} ${app_name} application version updated to ${updated[`${app_name}_app_version`]}`);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": `Successfully updated ${app_name} core settings.`,
            "payload": updated
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: `Could not update ${app_name} core settings.`
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not find core settings."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You are not authorized to perform this action."
    })
  };
};
