const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const verifyDiscountCode = require("../../../services/stripe/verify-discount-code");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { type, name, account_id } = event.queryStringParameters;
  if (type) {
    let account_plans = [];
    let org_plans = [];
    const partner_plans = await database.query("SELECT * from partner_plans where type = $1 AND account_id IS NULL AND org_name IS NULL AND status = 'active'", type);
    if (account_id) account_plans = await database.query("SELECT * from partner_plans where account_id = $1 AND org_name IS NULL AND status = 'active'", account_id);
    if (name) org_plans = await database.query("SELECT * from partner_plans where type = $1 AND account_id IS NULL AND org_name = $2 AND status = 'active'", type, name);
    const all_plans = [...partner_plans, ...account_plans, ...org_plans];
    if (all_plans.length) {
      let full_plans = [];
      for (let i = 0; i < all_plans.length; i++) {
        let plan = all_plans[i];
        if (plan.discount) {
          const discount = await verifyDiscountCode(plan.discount);
          if (discount.success) plan.coupon = discount.coupon;
        }
        full_plans.push(plan);
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched partner plans",
          "payload": full_plans
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any partner plans."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You must pass a partner type."
    })
  };
};
