const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const resetUserMFA = require("../../../../services/cognito/reset-user-mfa");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const { capitalize } = require("../../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { access_token, account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const users = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
    const disabled = await resetUserMFA(access_token);
    if (disabled) {
      await sendTemplateEmail(users.email, {
        first_name: capitalize(users.first_name),
        last_name: capitalize(users.last_name),
        template_type: "mfa_off",
        merge_fields: {
          first_name: capitalize(users.first_name),
          login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
          subject: "Urgent: Your MFA has been disabled",
          preheader: `${users.first_name}, your MFA has been disabled`
        }
      });
      return {
        statusCode: 200, headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully disabled user MFA."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not disable user MFA."
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
