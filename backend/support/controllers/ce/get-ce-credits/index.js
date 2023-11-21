const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

const final_exam_quiz_ids = {
  development: "rnq5f4ef74f3b227",
  staging: "rbr5f5021418ab57",
  production: "kyq5f50216dd56d6"
};

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const credits = await database.query(`SELECT
      qr.*,
      NULLIF(TRIM(concat(qr.proctor_first_name, ' ', qr.proctor_last_name)), '') as proctor_name,
      p.npn,
      p.resident_state_license_number,
      u.first_name,
      u.last_name,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as partner_name,
      u.state,
      cec.title as course_title,
      cec.requires_confirmation,
      ce.credits_value
      from quiz_responses qr
      JOIN users u on u.cognito_id = qr.cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = qr.cognito_id) AND u.status = 'active'
      JOIN partners p on p.cognito_id = qr.cognito_id AND p.status = 'active' AND p.version = (SELECT MAX (version) FROM partners where cognito_id = qr.cognito_id)
      LEFT JOIN ce_courses cec on cec.quiz_id = qr.quiz_id
      LEFT JOIN ce_configurations ce on ce.state = u.state
      where qr.status = 'active' AND qr.cognito_id = p.cognito_id`);
    if (credits.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched credits.",
          "payload": credits
        })
      };
    } 
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find credits."
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
