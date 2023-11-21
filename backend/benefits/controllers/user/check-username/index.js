const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { verifyEmailFormat } = require("../../../utilities/helpers");
const lookupCognitoUser = require("../../../services/cognito/lookup-cognito-user");
const deleteCognitoUser = require("../../../services/cognito/delete-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { username } = event.pathParameters;
  const users = await database.query("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", username);
  if (users.length) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "This username is already in use.",
        "error_code": "username_in_use"
      })
    };
  }

  return {
    statusCode: 200,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": true,
      "message": "Great! This username is available!"
    })
  };
};
