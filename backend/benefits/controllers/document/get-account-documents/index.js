const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { uniqBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const documents = await database.query("SELECT * from documents where account_id = $1", account_id);
    const linked_documents = await database.query("SELECT * from documents where associated_account_id = $1 AND private = $2", account_id, false);
    const static_documents = await database.query("SELECT * from documents where static = $1 AND static_type = $2", true, "benefits");

      if (documents.length || linked_documents.length || static_documents.length) {
        const all_documents = uniqBy([...documents, ...linked_documents, ...static_documents], "id");
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully fetched account documents",
            "payload": all_documents,
            "usage": all_documents.filter((d) => !d.static).reduce((a, { size }) => a + size, 0)
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not fetch any documents for this account.",
            "usage": 0
          })
        };
      }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
