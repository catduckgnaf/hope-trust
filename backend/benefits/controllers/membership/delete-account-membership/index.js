const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const removeContactFromDeal = require("../../../services/hubspot/remove-contact-from-deal");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, membership_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const user_memberships = await database.query("SELECT * from account_memberships where id = $1 AND status = 'active'", membership_id);
    const users = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", user_memberships[0].cognito_id);
    const accounts = await database.query("SELECT * from accounts where account_id = $1 AND status = 'active'", user_memberships[0].account_id);
    await database.query("UPDATE account_memberships set status = $1 where id = $2", "inactive", membership_id);
    const membership = await database.query("SELECT * from account_memberships where id = $1 AND status = $2", membership_id, "active");
    if (membership.length) {
      return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ success: false, message: "Could not delete membership record." }) };
    } else {
      if (users[0].hubspot_contact_id && accounts[0].hubspot_deal_id) await removeContactFromDeal(users[0].hubspot_contact_id, accounts[0].hubspot_deal_id);
      return { statusCode: 200, headers: getHeaders(), body: JSON.stringify({ success: true, message: "Successfully deleted membership record"}) };
    }
  } else {
    return { statusCode: 401, headers: getHeaders(), body: JSON.stringify({ success: false, message: "You are not authorized to perform this action." }) };
  }
};