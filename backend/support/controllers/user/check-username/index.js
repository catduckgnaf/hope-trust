const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { username } = event.pathParameters;
  const user = await database.queryOne("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", username);
  if (user) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "This username is already in use.",
        "error_code": "username_in_use"
      })
    };
  }
  return {
    statusCode: 200,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": true,
      "message": "Great! This username is available!"
    })
  };
};
