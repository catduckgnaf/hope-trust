const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { isThirdPartyAuthorized } = require("../../../../permissions/helpers.js");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newDocument } = JSON.parse(event.body);
  if (isThirdPartyAuthorized(event, "GIZMO")) {
    const document = await database.queryOne("SELECT * from documents where account_id = $1 AND filename = $2", account_id, newDocument.filename);
    if (!document) {
      const created = await database.insert(
        "documents", {
          ...newDocument,
          cognito_id,
          account_id
        }
      );
      if (created) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new document.",
            "payload": created
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new document."
        })
      };
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Document already exists, updating document."
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
