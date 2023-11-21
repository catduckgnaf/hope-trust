const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, user_cognito_id, question_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const response = await database.queryOne(`SELECT
    sqr.*,
    sq.question
    FROM security_question_responses sqr
    JOIN security_questions sq ON sq.id = sqr.question_id
    WHERE sqr.cognito_id = $1 AND sqr.question_id = $2`, user_cognito_id, question_id);
    if (response) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully fetched security question responses for user.",
          payload: response
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
