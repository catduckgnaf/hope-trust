const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newSurvey } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const exists = await database.queryOne("SELECT * from surveys where survey_id = $1 AND survey_name = $2 status = 'active'", newSurvey.survey_id, newSurvey.survey_name);
    if (exists) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "An active survey with this survey ID and name already exists."
        })
      };
    }
    const created = await database.insert(
      "surveys", {
        ...newSurvey,
        cognito_id
      }
    );
    if (created) {
      const record = await database.queryOne(`SELECT
        s.*,
        array_position(ss.survey_order::text[], s.survey_name::text) as sort_order
        from surveys s
        JOIN system_settings ss ON ss.id = 'system_settings'
        where s.id = $1`, created.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created survey.",
          "payload": record
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create survey."
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