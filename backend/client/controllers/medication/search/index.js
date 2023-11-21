const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const searchDrugNames = require("../../../services/drugbank/search-drug-names");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { query } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const results = await searchDrugNames(query);
    if (results.error) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": `No results found for ${query}`
        })
      };
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": `Found ${results.products.length} results for ${query}`,
        "payload": results.products
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
