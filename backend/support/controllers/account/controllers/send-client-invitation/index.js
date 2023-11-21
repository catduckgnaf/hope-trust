const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const { capitalize } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { config } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) { 
    const owner = await database.queryOne("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1 AND status = 'active')", config.owner_id);
    const sent_email = await sendTemplateEmail(config.invite_email, {
      first_name: capitalize(config.invite_first),
      last_name: capitalize(config.invite_last),
      template_type: "benefits_client_invitation",
      merge_fields: {
        first_name: capitalize(config.invite_first),
        sender_first: capitalize(owner.first_name),
        sender_last: capitalize(owner.last_name),
        organization: config.group_name,
        invite_id: config.invite_id,
        environment: process.env.STAGE,
        signup_url: config.invite_url,
        subject: "Claim Your Hope Trust Employee Benefit",
        preheader: `${capitalize(owner.first_name)} ${capitalize(owner.last_name)} has invited you to sign up for Hope Trust, register to claim your employee benefit.`
      }
    });
    if (sent_email) {
      const updated = await database.updateById("benefits_client_config", config.id, { invite_status: "sent" });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully sent invitation",
          "payload": updated
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not send invitation."
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
