const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id, ticket_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    let updated = false;
    if (updates.comment) {
      const commenter = await database.queryOne("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", cognito_id);
      updated = await database.query("UPDATE service_requests SET comments = comments || $2::jsonb where id = $1", ticket_id, { ...updates.comment, "created_at": new Date(), cognito_id, name: `${commenter.first_name} ${commenter.last_name}` });
    } else {
      updated = await database.updateById("service_requests", ticket_id, updates);
    }
    if (updated) {
      const request = await database.queryOne("SELECT sr.*, u.first_name as creator_first, u.last_name as creator_last, uu.first_name as assignee_first, uu.last_name as assignee_last from service_requests sr JOIN users u on u.cognito_id = sr.cognito_id LEFT JOIN users uu on uu.cognito_id = sr.assignee where sr.id = $1", updated.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated service request.",
          "payload": request
        })
      };
    }
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update service request."
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
