const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const removeContactFromDeal = require("../../../services/hubspot/remove-contact-from-deal");

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { cognito_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const accounts = await database.query("SELECT * from accounts where account_id = $1 AND status = $2", account_id, "active");
    const users = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", cognito_id, "active");
    const requester = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
    const current_member = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito_id, account_id, "active");
    if (!current_member.length) return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ success: false, message: "Could not find an active user to delete." }) };
    await database.query("UPDATE account_memberships SET status = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", "inactive", cognito_id, account_id, "active");
    const isMember = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito_id, account_id, "active");
    if (isMember.length) {
      return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ success: false, message: "Could not delete user." }) };
    } else {
      if (users[0].hubspot_contact_id && accounts[0].hubspot_deal_id) await removeContactFromDeal(users[0].hubspot_contact_id, accounts[0].hubspot_deal_id);
      if (current_member[0].notified) {
        await sendTemplateEmail(users[0].email, {
          first_name: capitalize(users[0].first_name),
          last_name: capitalize(users[0].last_name),
          template_type: "membership_removed",
          merge_fields: {
            first_name: capitalize(users[0].first_name),
            login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
            requester_first: capitalize(requester[0].first_name),
            requester_last: capitalize(requester[0].last_name),
            subject: "You have been removed from an account",
            preheader: `${capitalize(users[0].first_name)}, you have been removed from an account.`
          }
        });
      }
      return { statusCode: 200, headers: getHeaders(), body: JSON.stringify({ success: true, message: "Successfully deleted user"}) };
    }
  } else {
    return { statusCode: 401, headers: getHeaders(), body: JSON.stringify({ success: false, message: "You are not authorized to perform this action." }) };
  }
};
