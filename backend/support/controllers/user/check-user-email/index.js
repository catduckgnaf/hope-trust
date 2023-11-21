const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { verifyEmailFormat } = require("../../../utilities/helpers");
const lookupCognitoUser = require("../../../services/cognito/lookup-cognito-user");
const deleteCognitoUser = require("../../../services/cognito/delete-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { email } = event.pathParameters;
  const { type } = event.queryStringParameters;
  const user = await database.queryOne("SELECT * from users where email = $1 AND status = ANY($2)", email, '{"active", "inactive", "pending"}');

  if (!user) {
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

  let success_message;
  let error_message;
  if (!user) {
    switch (type) {
      case "user":
        success_message = "Great! This email is available!";
        break;
      case "client":
        success_message = "Great! This email is available!";
        break;
      case "relationship":
        success_message = "Great! This email is available!";
        break;
      case "customer-support":
        if (email.includes("@hopetrust.com")) success_message = "Great! This email is available!";
        else {
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "This email is available, but it is not a Hope Trust email."
            })
          };
        }
        break;
      case "partner":
        success_message = "Great! This email is available!";
        break;
      case "advisor":
        success_message = "Great! This email is available!";
        break;
      default:
        success_message = "Great! This email is available!";
        break;
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": success_message
      })
    };
  }
  switch (type) {
    case "user":
      error_message = "Oops. This email is already in use.";
      break;
    case "client":
      error_message = "Oops. This email is already in use.";
      break;
    case "relationship":
      error_message = "Oops. This email is already in use.";
      break;
    case "customer-support":
      if (email.includes("@hopetrust.com")) error_message = "Oops. This email is already in use.";
      else error_message = "Oops. This email is already in use, it is also not a Hope Trust email.";
      break;
    case "partner":
      error_message = "Oops. This email is already in use.";
      break;
    case "advisor":
      error_message = "Oops. This email is already in use.";
      break;
    default:
      error_message = "Oops. This email is already in use.";
      break;
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
