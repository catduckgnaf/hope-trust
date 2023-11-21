const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const deleted = await database.deleteById("account_benefits", id);
    if (deleted) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully deleted benefit record"
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not delete benefit record."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You are not authorized to perform this action."
    })
  };
};