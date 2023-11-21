const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, survey_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const deleted = await Promise.all([
      database.update("survey_sessions", { status: "inactive" }, { survey_id, account_id }),
      database.update("survey_responses", { status: "inactive" }, { survey_id, account_id }),
      database.delete("DELETE from ax_authorization_credentials where survey_id = $1 AND account_id = $2", survey_id, account_id)
    ]);
    if (deleted.some((e) => e)) {
      const session = await database.queryOne(`SELECT
        s.*,
        array_position(sys.survey_order::text[], s.survey_id::text) as sort_order
        from surveys s
        JOIN system_settings sys ON sys.id = 'system_settings'
        where s.survey_id = $1 AND s.status = 'active'`, survey_id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully cleared survey data.",
          "payload": session
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not clear survey data."
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
