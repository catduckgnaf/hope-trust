const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { isThirdPartyAuthorized } = require("../../../../permissions/helpers.js");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, survey_id } = event.pathParameters;
  if (isThirdPartyAuthorized(event, "GIZMO")) {
    const session = await database.queryOne("SELECT * from survey_responses where account_id = $1 AND survey_id = $2 AND status = $3", account_id, survey_id, "active");
    if (session) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: `session_id=${session.session_id}`
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: ""
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
