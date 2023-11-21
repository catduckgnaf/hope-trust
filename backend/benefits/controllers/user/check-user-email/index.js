const { database } = require("../../../postgres");
const { getHeaders, warm, headless } = require("../../../utilities/request");
const { verifyEmailFormat } = require("../../../utilities/helpers");
const lookupCognitoUser = require("../../../services/cognito/lookup-cognito-user");
const deleteCognitoUser = require("../../../services/cognito/delete-cognito-user");

exports.handler = async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  if (!event.headers["sec-ch-ua"]) return headless;
  const { email } = event.pathParameters;
  const { type } = event.queryStringParameters;
  const users = await database.query("SELECT * from users where email = $1 AND status = ANY($2)", email, ["active", "inactive", "pending"]);

  if (!users.length) {
    const is_cognito_user = await lookupCognitoUser(email, type);
    if (is_cognito_user.success) await deleteCognitoUser(email, type);
  }


  if (!verifyEmailFormat(email)) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "This email is not a valid format."
      })
    };
  }

  let success_message = "Great! This email is available!";
  let error_message = "Oops. This email is already in use.";
  if (!users.length) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": success_message
      })
    };
  }
  return {
    statusCode: 200,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": error_message,
      "error_code": "email_in_use"
    })
  };
};
