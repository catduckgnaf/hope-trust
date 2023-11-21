const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, ticket_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const request = await database.queryOne("SELECT sr.*, u.first_name as creator_first, u.last_name as creator_last, uu.first_name as assignee_first, uu.last_name as assignee_last from service_requests sr JOIN users u on u.cognito_id = sr.cognito_id LEFT JOIN users uu on uu.cognito_id = sr.assignee where sr.id = $1", ticket_id);
    if (request) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched service request ticket.",
          "payload": request
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find service request ticket."
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
