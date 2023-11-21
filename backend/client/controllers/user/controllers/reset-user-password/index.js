const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const resetUserPassword = require("../../../../services/cognito/reset-user-password");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const { capitalize } = require("../../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { user } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const reset = await resetUserPassword(user.email);
    if (reset) {
      const email_sent = await sendTemplateEmail(user.email, {
        first_name: capitalize(user.first_name),
        last_name: capitalize(user.last_name),
        template_type: "reset_password",
        merge_fields: {
          first_name: capitalize(user.first_name),
          login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
          password: reset,
          subject: "Your new temporary password",
          preheader: `${user.first_name}, your password has been reset`
        }
      });
      if (email_sent) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            success: true,
            message: "Successfully reset user password."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "Could not send password reset email."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not reset user password."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You are not authorized to perform this action."
    })
  };
};
