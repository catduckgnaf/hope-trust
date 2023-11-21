const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { capitalize } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { type, client_info, invite_info, group } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const users = await database.query("SELECT first_name, last_name, email from users where cognito_id = $1 AND status = 'active' AND version = (SELECT MAX (version) FROM users uu where uu.cognito_id = $1 AND uu.status = 'active')", cognito.id);
    if (!users.length) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find entity."
        })
      };
    }
    const sent_email = await sendTemplateEmail(client_info.beneficiaryEmail, {
      first_name: capitalize(client_info.beneficiaryFirst),
      last_name: capitalize(client_info.beneficiaryLast),
      template_type: "benefits_client_invitation",
      merge_fields: {
        type,
        first_name: capitalize(client_info.beneficiaryFirst),
        sender_first: capitalize(users[0].first_name),
        sender_last: capitalize(users[0].last_name),
        organization: group.name,
        invite_id: invite_info.id,
        environment: process.env.STAGE,
        signup_url: invite_info.signup_url,
        subject: "Claim Your Hope Trust Employee Benefit",
        preheader: `${capitalize(users[0].first_name)} ${capitalize(users[0].last_name)} has invited you to sign up for Hope Trust, register to claim your employee benefit.`
      }
    });
    if (sent_email) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully sent invitation"
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not send invitation."
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
