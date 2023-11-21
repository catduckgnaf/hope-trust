const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const deleteS3Object = require("../../../services/s3/delete-s3-object");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { key, target_account_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const document = await deleteS3Object(target_account_id, key);
    if (document.success) {
      const deleted = await database.delete("DELETE from documents where account_id = $1 AND filename = $2", target_account_id, key);
      if (deleted) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            success: true,
            message: "Successfully deleted document",
            payload: deleted.filename
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "Could not delete document."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not delete S3 object"
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
