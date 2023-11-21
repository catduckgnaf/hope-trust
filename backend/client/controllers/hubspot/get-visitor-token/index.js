const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getVisitorToken = require("../../../services/hubspot/get-visitor-token");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
    if (user) {
      const response = await getVisitorToken(user);
      if (response.success) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": response.message,
            "payload": response.token
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": response.message
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find a user."
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
