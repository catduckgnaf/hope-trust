const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const questions = await database.query("SELECT * from security_questions");
    if (!questions.length) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "Could not fetch security questions." })
        };
    } else {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully fetched security questions.",
          payload: questions
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};