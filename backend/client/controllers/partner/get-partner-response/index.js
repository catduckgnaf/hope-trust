const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id, quiz_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const response = await database.queryOne("SELECT * from quiz_responses where account_id = $1 AND cognito_id = $2 AND quiz_id = $3 AND status = $4", account_id, cognito_id, quiz_id, "active");
    if (response) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched account quiz responses",
          "payload": response
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any quiz responses for this account."
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