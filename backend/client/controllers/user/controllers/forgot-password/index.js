const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const resetUserPassword = require("../../../../services/cognito/reset-user-password");
const lookupCognitoUser = require("../../../../services/cognito/lookup-cognito-user");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const { capitalize } = require("../../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { email } = event.queryStringParameters;
  if (email) {
    const user = await database.queryOne("SELECT * from users where LOWER(email) = $1", email.toLowerCase());
    if (user) {
      const isUser = await lookupCognitoUser(user.email);
      if ((isUser.success && isUser.user.UserStatus === "CONFIRMED") && isUser.user.verifications.length) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            success: true,
            flow: "forgot-password",
            message: "User is confirmed. Please use forgot password."
          })
        };
      } else if (isUser.success) {
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
                flow: "login",
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
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "We could not find an active Cognito user with this email."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "We could not find an active Hope Trust user with this email."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You must provide an email to reset a user password."
    })
  };
};
