const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const verifyDiscountCode = require("../../../services/stripe/verify-discount-code");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { code } = JSON.parse(event.body);
  const verified = await verifyDiscountCode(code);
  if (!verified.success) {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "This code is not valid."
      })
    };
  } else {
    const partner = await database.query("SELECT am.referral_code, p.name, u.first_name, u.last_name from account_memberships am JOIN partners p ON p.cognito_id = am.cognito_id AND p.status = 'active' JOIN users u ON u.cognito_id = p.cognito_id AND u.status = 'active' where am.referral_code = $1 AND am.status = 'active'", verified.coupon.id);
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully verified Stripe coupon.",
        "payload": { ...verified.coupon, partner: partner.length ? partner[0] : null }
      })
    };
  }
};
