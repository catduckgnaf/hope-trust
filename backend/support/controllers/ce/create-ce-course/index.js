const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newCECourse } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const created = await database.insert(
      "ce_courses", {
        ...newCECourse,
        cognito_id
      }
    );
    if (created) {
      const course = await database.queryOne(`SELECT
        ce.*,
        (SELECT AVG(qr.percentage)::numeric(10,0) from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as average_score,
        (SELECT string_agg(p.cognito_id, ',') from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = true AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as passed,
        (SELECT string_agg(p.cognito_id, ',') from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = false AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as failed,
        (SELECT string_agg(p.cognito_id, ',') from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as accounts,
        (SELECT COUNT(*)::int from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as count,
        (SELECT COUNT(*)::int from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = true AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as count_passed,
        (SELECT COUNT(*)::int from quiz_responses qr JOIN partners p ON p.cognito_id = qr.cognito_id JOIN users u on u.cognito_id = p.cognito_id where qr.quiz_id = ce.quiz_id AND qr.passed = false AND qr.status = 'active' AND p.status = 'active' AND u.status = 'active') as count_failed
        from ce_courses ce where ce.id = $1`, created.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new course.",
          "payload": course
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new course."
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