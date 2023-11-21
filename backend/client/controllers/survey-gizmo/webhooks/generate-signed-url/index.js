const { getHeaders, warm } = require("../../../../utilities/request");
const getSignedURL = require("../../../../services/s3/get-signed-url");
const { isThirdPartyAuthorized } = require("../../../../permissions/helpers.js");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, key, type } = JSON.parse(event.body);
  if (isThirdPartyAuthorized(event, "GIZMO")) {
    const signedURL = await getSignedURL({
      account_id,
      key,
      method: "putObject",
      type,
      urlConfig: {
        Expires: 3600,
      }
    });
    if (signedURL) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully generated signed URL",
          "payload": signedURL
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": signedURL.message
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