const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { compact, orderBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const surveys = await database.query(`SELECT DISTINCT ON (s.survey_name)
      s.*,
      sr.processing,
      ss.cognito_id,
      ss.account_id,
      ss.session_id,
      ss.is_complete,
      ss.access_time,
      ss.updated_at,
      case
        when s.admin_override != true then array_position(sys.survey_order::text[], s.survey_name::text)
      else 
          null
      end as sort_order
      from surveys s
      LEFT JOIN survey_sessions ss ON ss.account_id = $1 AND ss.survey_id = s.survey_id AND ss.status = 'active'
      LEFT JOIN survey_responses sr ON sr.account_id = ss.account_id AND sr.survey_id = ss.survey_id AND sr.status = 'active'
      LEFT JOIN partners p on p.cognito_id = $2 AND p.status = 'active'
      JOIN system_settings sys ON sys.id = 'system_settings'
      where (s.status = 'active' AND s.account_id = $1) OR (s.status = 'active' AND (p.name IS NOT NULL AND s.organization IS NOT NULL) AND p.name = s.organization) OR (s.status = 'active' AND s.organization IS NULL AND s.account_id IS NULL)`, account_id, cognito_id);
    if (surveys.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched survey sessions",
          "payload": orderBy(compact(surveys), ["sort_order", (s) => s.organization], ["asc", "asc"])
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch survey sessions."
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
