const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const settings = await database.query("SELECT * from user_notification_settings where cognito_id = $1 AND account_id = $2", cognito_id, account_id);
    if (!settings.length) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "Could not find notification settings for user."
        })
      };
    }
    const updated = await database.updateById(
    "user_notification_settings", settings[0].id, {
      ...settings[0],
      ...updates
    });
    if (updated) {
      const updatedSettings = await database.query("SELECT * from user_notification_settings where cognito_id = $1 AND account_id = $2", cognito_id, account_id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated users notification settings",
          "payload": updatedSettings[0]
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "Could not update notification settings for user."
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "You are not authorized to perform this action."
      })
    };
  }
};
