const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { capitalize } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { organization, first, last, email, sender, type } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const sent_email = await sendTemplateEmail(email, {
      first_name: capitalize(first),
      last_name: capitalize(last),
      template_type: "benefits_entity_invitation",
      merge_fields: {
        type,
        first_name: capitalize(first),
        sender_first: capitalize(sender.first_name),
        sender_last: capitalize(sender.last_name),
        organization,
        signup_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/register?email=${email}&firstname=${first}&lastname=${last}&organization=${organization}&type=${type}`,
        subject: "You have been invited to sign up on the Hope Trust Benefits Network",
        preheader: `${capitalize(sender.first_name)} ${capitalize(sender.last_name)} has invited you to sign up on the Hope Trust Benefits Network`
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
