const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { isThirdPartyAuthorized } = require("../../../../permissions/helpers.js");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  if (isThirdPartyAuthorized(event, "GIZMO")) {
    const { cognito_id, account_id, survey_id } = event.pathParameters;
    const oldResponse = await database.queryOne("SELECT DISTINCT ON (session_id) * from survey_sessions where account_id = $1 AND survey_id = $2 AND status = 'active' ORDER BY session_id, access_time DESC", account_id, survey_id);
    if (oldResponse) {
      const oldResponseUpdated = await database.update("survey_sessions", { status: "inactive" }, { account_id, survey_id });
      if (oldResponseUpdated) {
        delete oldResponse.id;
        const created = await database.insert(
          "survey_sessions", {
            ...oldResponse,
            cognito_id,
            access_time: new Date(),
            is_complete: true,
            status: "active"
          }
        );
        if (created) {
          console.info(`Survey Complete - Survey ID: ${survey_id} - Account ID: ${account_id}`);
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: "is_complete=true"
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: "is_complete=false"
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find or update survey response.",
          "body": "is_complete=false"
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not mark survey complete.",
        "body": "is_complete=false"
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};

