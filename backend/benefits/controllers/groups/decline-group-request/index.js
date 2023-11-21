const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { capitalize } = require("lodash");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { request_id, account_id } = event.pathParameters;
  const { config_id, cognito_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
      const updated = await database.updateById("group_connections", request_id, { status: "declined" });
      if (updated) {
        const record = await database.query("SELECT * from group_connections where id = $1", request_id);
        const user = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", cognito_id);
        let found_group = await database.query("SELECT * from groups where config_id = $1 AND status = 'active'", config_id);
        if (user.length && found_group.length) {
          await sendTemplateEmail(user[0].email, {
            first_name: capitalize(user[0].first_name),
            last_name: capitalize(user[0].last_name),
            template_type: "group_connection_request_declined",
            merge_fields: {
              first_name: capitalize(user[0].first_name),
              group_name: capitalize(found_group[0].name),
              login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
              subject: "Connection Request Declined",
              preheader: `Your request to join ${capitalize(found_group[0].name)} has been declined.`
            }
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated group connection",
            "payload": record[0]
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not update group connection."
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
};
