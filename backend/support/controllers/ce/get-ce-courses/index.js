const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const courses = await database.query(`SELECT
      ce.*,
      (SELECT AVG(qr.percentage)::numeric(10,0) from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as average_score,
      (SELECT string_agg(p.cognito_id, ',') from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = true AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as passed,
      (SELECT string_agg(p.cognito_id, ',') from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = false AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as failed,
      (SELECT string_agg(p.cognito_id, ',') from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as accounts,
      (SELECT COUNT(*)::int from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as count,
      (SELECT COUNT(*)::int from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = true AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as count_passed,
      (SELECT COUNT(*)::int from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = false AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as count_failed
      from ce_courses ce`);
    if (courses.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched courses.",
          "payload": courses
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find courses."
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
