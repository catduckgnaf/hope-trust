const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { orderBy, compact } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { survey_ids } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let requests = [];
    survey_ids.forEach((survey_id) => {
      requests.push(database.queryOne(`SELECT DISTINCT ON (s.survey_name, s.survey_id)
      sr.html,
      sr.survey_id,
      s.survey_name,
      case
        when s.admin_override != true then array_position(ss.survey_order::text[], s.survey_name::text)
      else 
          null
      end as sort_order
      FROM survey_responses sr
      LEFT JOIN surveys s ON s.survey_id = sr.survey_id AND s.status = 'active'
      JOIN system_settings ss ON ss.id = 'system_settings'
      WHERE sr.account_id = $1
      AND sr.survey_id = $2
      AND sr.status = 'active'`, account_id, survey_id));
    });
    const surveys = await Promise.all(requests);
    const sorted = orderBy(compact(surveys), "sort_order", "ASC");
    if (sorted.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully generated plan blocks.",
          "payload": sorted
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not generate plan blocks."
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
