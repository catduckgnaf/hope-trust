const { getHeaders, warm } = require("../../../utilities/request");
const deleteCognitoUser = require("../../../services/cognito/delete-cognito-user");
const lookupCognitoUser = require("../../../services/cognito/lookup-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { email } = event.pathParameters;
  const is_cognito_user = await lookupCognitoUser(email, null);

  if (is_cognito_user.success) {
    const deleted = await deleteCognitoUser(email, null);
    if (!deleted) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not delete Cognito user."
        })
      };
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully deleted Cognito user."
      })
    };
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "This user cannot be deleted. User is confirmed."
      })
    };
  }
};
