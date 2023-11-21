const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { isThirdPartyAuthorized } = require("../../../../permissions/helpers.js");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  if (isThirdPartyAuthorized(event, "GIZMO")) {
    const { cognito_id, account_id, survey_name, survey_id } = event.pathParameters;
    const { session_id } = event.queryStringParameters;
    const oldSession = await database.queryOne("SELECT DISTINCT ON (session_id) * from survey_sessions where account_id = $1 AND survey_id = $2 AND session_id = $3 AND status = 'active' ORDER BY session_id, access_time DESC", account_id, survey_id, session_id);
    if (oldSession) {
      const oldSessionUpdated = await database.update("survey_sessions", { status: "inactive" }, { account_id, survey_id });
      if (oldSessionUpdated) {
        delete oldSession.id;
        const created = await database.insert(
          "survey_sessions", {
            ...oldSession,
            cognito_id,
            access_time: new Date(),
            status: "active"
          }
        );
        if (created) {
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: "stored=true"
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: "stored=false"
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: "stored=false"
      };
    }
    const created = await database.insert(
      "survey_sessions", {
        cognito_id,
        account_id,
        survey_id,
        survey_name,
        is_complete: false,
        access_time: new Date(),
        session_id,
        status: "active"
      }
    );
    if (created) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "stored=true"
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: "stored=false"
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

