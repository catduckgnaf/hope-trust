const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const verifyDiscountCode = require("../../../../services/stripe/verify-discount-code");
const { getAccountUser } = require("../../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { cognito_id, account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isRequestUser) {
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", cognito_id);
    const full_user = await getAccountUser(cognito_id, account_id);
    const partner_data = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = 'active' AND version = (SELECT MAX (version) FROM partners where cognito_id = $1 AND status = 'active')", cognito_id);
    const benefits_client_config = await database.queryOne("SELECT bcc.*, g.name, bc.logo from benefits_client_config bcc JOIN groups g ON g.id = bcc.group_id JOIN benefits_config bc ON bc.id = g.config_id where bcc.account_id = $1 AND bcc.status = 'pending'", cognito_id);
    if (user) {
      if (benefits_client_config) user.benefits_client_config = benefits_client_config;
      if (partner_data) {
        user.partner_data = partner_data;
        user.is_partner = true;
        const partner_org = await database.queryOne("SELECT * from referral_configurations where name = $1", user.partner_data.name);
        if (partner_org) user.partner_org = partner_org; 
        const partner_membership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito_id, cognito_id, "active");
        if (partner_membership) {
          const referral_code = partner_membership.referral_code;
          if (referral_code) {
            const verified = await verifyDiscountCode(referral_code);
            if (verified.success) user.coupon = verified.coupon;
          }
        }
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched user",
          "payload": {
            ...user,
            ...(full_user && { ...full_user }),
            verifications: cognito.verifications
          }
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch user."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to request this user."
    })
  };
};
