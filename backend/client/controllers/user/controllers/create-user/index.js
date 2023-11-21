const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { newUser, account_id, status = "active", invite_code } = JSON.parse(event.body);
  if (newUser.cognito_id) {
    const cognito = await getCognitoUser(event, account_id);
    if (cognito.isRequestUser) {
      let username = null;
      if (newUser.email) {
        const is_username_taken = await database.queryOne("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", newUser.email.split("@")[0]);
        if (!is_username_taken) username = newUser.email.split("@")[0];
      }
      const created = await database.insert(
        "users", {
          ...newUser,
          username,
          status,
          "version": 1
        }
      );
      if (created) {
        if (invite_code) {
          const invite = await database.queryOne("SELECT * from benefits_client_config where invite_code = $1 AND status = 'pending'", invite_code);
          if (invite) await database.updateById("benefits_client_config", invite.id, { account_id });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created user",
            "payload": created
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create user."
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
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You must provide information to create a new user."
    })
  };
};
