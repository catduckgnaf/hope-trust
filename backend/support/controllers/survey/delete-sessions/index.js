const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { session_ids } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let success = [];
    let failed = [];
    for (let i = 0; i < session_ids.length; i++) {
      const id = session_ids[i];
      const session = await database.queryOne("SELECT * from survey_sessions where id = $1", id);
      const deleted = await Promise.all([
        database.update("survey_sessions", { status: "inactive" }, { survey_id: session.survey_id, account_id: session.account_id }),
        database.update("survey_responses", { status: "inactive" }, { survey_id: session.survey_id, account_id: session.account_id }),
        database.delete("DELETE from ax_authorization_credentials where survey_id = $1 AND account_id = $2", session.survey_id, session.account_id)
      ]);
      if (deleted.length) success.push(id);
      else failed.push(id);
    }
    if (success.length === session_ids.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully deleted sessions.",
          "payload": {
            success
          }
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not delete selected sessions.",
        "payload": {
          success,
          failed
        }
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
