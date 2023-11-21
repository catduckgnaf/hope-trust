const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const responses = await database.query("SELECT * from security_question_responses where cognito_id = $1 ORDER BY created_at DESC LIMIT 3", cognito_id);
    if (responses.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully fetched security question responses for user.",
          payload: responses
        })
      };
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not fetch security question responses for user.",
        payload: []
      }),
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
