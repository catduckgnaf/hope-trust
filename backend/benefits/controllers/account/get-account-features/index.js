const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { lookup_id } = event.queryStringParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const account_features = await database.query("SELECT * from account_features where account_id = $1", lookup_id);
    if (account_features.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched account features.",
          "payload": account_features[0]
        })
      };
    } else {
      const created = await database.insert("account_features", { account_id: lookup_id });
      if (!created) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create account features."
          })
        };
      }
      const created_features = await database.query("SELECT * from account_features where account_id = $1", lookup_id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created account features.",
          "payload": created_features[0]
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
