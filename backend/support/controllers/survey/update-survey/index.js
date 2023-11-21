const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { survey_id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (updates.survey_id) {
      const exists = await database.queryOne("SELECT * from surveys where survey_id = $1 AND status = 'active'", updates.survey_id);
      if (exists && exists.survey_id !== updates.survey_id) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "An active survey with this survey ID already exists."
          })
        };
      }
    }
    const updated = await database.updateById("surveys", survey_id, updates);
    if (updated) {
      const record = await database.queryOne(`SELECT
        s.*,
        array_position(ss.survey_order::text[], s.survey_name::text) as sort_order
        from surveys s
        JOIN system_settings ss ON ss.id = 'system_settings'
        where s.id = $1`, updated.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated survey record",
          "payload": record
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update survey record."
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