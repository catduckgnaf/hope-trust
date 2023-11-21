const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getS3Object = require("../../../services/s3/get-s3-object");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { key, associated_account_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const document = await getS3Object((associated_account_id || account_id), key);
    if (document.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched document",
          "payload": document.url
        })
      };
    }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": document.message
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
