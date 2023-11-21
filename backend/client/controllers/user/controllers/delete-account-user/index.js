const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const removeContactFromDeal = require("../../../../services/hubspot/remove-contact-from-deal");
const { capitalize } = require("../../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { cognito_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = $2", account_id, "active");
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito_id, "active");
    const requester = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
    const current_member = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito_id, account_id, "active");
    if (current_member) {
      const deleted = await database.update("account_memberships", { status: "inactive" }, { cognito_id, account_id, status: "active" });
      if (deleted) {
        if (user.hubspot_contact_id && account.hubspot_deal_id) await removeContactFromDeal(user.hubspot_contact_id, account.hubspot_deal_id);
        if (current_member.notified) {
          await sendTemplateEmail(user.email, {
            first_name: capitalize(user.first_name),
            last_name: capitalize(user.last_name),
            template_type: "membership_removed",
            merge_fields: {
              first_name: capitalize(user.first_name),
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
              requester_first: capitalize(requester.first_name),
              requester_last: capitalize(requester.last_name),
              subject: "You have been removed from an account",
              preheader: `${capitalize(user.first_name)}, you have been removed from an account.`
            }
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            success: true,
            message: "Successfully deleted user"
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "Could not delete user."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not find an active user to delete."
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
