const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const removeContactFromDeal = require("../../../services/hubspot/remove-contact-from-deal");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, membership_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const user_membership = await database.queryOne("SELECT * from account_memberships where id = $1 AND status = 'active'", membership_id);
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", user_membership.cognito_id);
    const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", user_membership.account_id);
    const deleted = await database.updateById("account_memberships", membership_id, { status: "inactive" });
    if (deleted) {
      if (user.hubspot_contact_id && account.hubspot_deal_id) await removeContactFromDeal(user.hubspot_contact_id, account.hubspot_deal_id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully deleted membership record"
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not delete membership record."
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