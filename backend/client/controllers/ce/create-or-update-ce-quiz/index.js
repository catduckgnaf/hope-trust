const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { updates, quiz_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const existing_response = await database.queryOne("SELECT * from quiz_responses where account_id = $1 AND status = 'active' AND quiz_id = $2", account_id, quiz_id);
    if (!existing_response) {
      const created = await database.insert(
        "quiz_responses", {
          ...updates,
          quiz_id,
          account_id,
          cognito_id,
          access_time: new Date(),
          status: "active"
        }
      );
      if (created) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created quiz response",
            "payload": created
          })
        };
      }
    }
    const updated = await database.updateById("quiz_responses", existing_response.id, updates);
    if (updated) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated quiz",
          "payload": updated
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update quiz."
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