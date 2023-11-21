const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const createSendgridContact = require("../../../services/sendgrid/create-sendgrid-contact");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { newUser, account_id, user_type, list_slug } = JSON.parse(event.body);
  if (newUser.cognito_id) {
    const cognito = await getCognitoUser(event, account_id);
    if (cognito.isRequestUser) {
      let username = null;
      if (newUser.email) {
        const is_username_taken = await database.query("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", newUser.email.split("@")[0]);
        if (!is_username_taken.length) username = newUser.email.split("@")[0];
      }
      const created = await database.insert(
        "users", {
          ...newUser,
          username,
          "status": "active",
          "version": 1
        }
      );
      if (created) {
        const user = await database.query("SELECT * from users where id = $1", created);
        await createSendgridContact(newUser, (list_slug || "registrations"), process.env.STAGE === "production");
        if (!user.length) {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not find created user."
            })
          };
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created user",
            "payload": user[0]
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create user."
          })
        };
      }
    } else {
      return {
        statusCode: 401,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "You are not authorized to perform this action."
        })
      };
    }
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You must provide information to create a new user."
      })
    };
  }
};
