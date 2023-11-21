const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const sessions = await database.query(`SELECT DISTINCT ON (ss.session_id, s.survey_id, ss.account_id)
      ss.*,
      s.survey_name,
      s.category,
      s.slug,
      s.survey_id,
      s.icon,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as account_name,
      NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), '') as updated_by
      from survey_sessions ss
      LEFT JOIN surveys s on s.survey_id = ss.survey_id AND s.admin_override = false
      JOIN users u on u.cognito_id = ss.account_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = ss.account_id AND uu.status = 'active')
      JOIN users uuu on uuu.cognito_id = ss.cognito_id AND uuu.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = ss.cognito_id AND uu.status = 'active')
      where ss.status = 'active'`);
    if (sessions.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched sessions.",
          "payload": sessions
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find sessions."
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