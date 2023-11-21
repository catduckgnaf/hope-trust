const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const resetSingleUserMFA = require("../../../../services/cognito/reset-single-user-mfa");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, target_id, type } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", target_id);
    const disabled = await resetSingleUserMFA(user.email, type);
    if (disabled) {
      await sendTemplateEmail(user.email, {
        first_name: capitalize(user.first_name),
        last_name: capitalize(user.last_name),
        template_type: "mfa_off",
        merge_fields: {
          first_name: capitalize(user.first_name),
          login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
          subject: "Urgent: Your MFA has been disabled",
          preheader: `${user.first_name}, your MFA has been disabled`
        }
      });
      return {
        statusCode: 200,
        headers: getHeaders(),
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
