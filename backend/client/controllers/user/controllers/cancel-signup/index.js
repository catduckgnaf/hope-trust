const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const deleteCognitoUser = require("../../../../services/cognito/delete-cognito-user");
const lookupCognitoUser = require("../../../../services/cognito/lookup-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { email } = event.pathParameters;
  const active_user = await database.queryOne("SELECT * from users where email = $1 AND status = 'active'", email);
  const pending_user = await database.queryOne("SELECT * from users where email = $1 AND status = 'pending'", email);
  const is_cognito_user = await lookupCognitoUser(email);
  if (!active_user && !pending_user && is_cognito_user.success) {
    const deleted = await deleteCognitoUser(email);
    if (deleted) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully deleted Cognito user.",
          "deleted": true
        })
      };
    }
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
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": is_cognito_user.message || "This user cannot be deleted. User is confirmed."
    })
  };
};
