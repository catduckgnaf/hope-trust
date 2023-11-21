const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const verifyDiscountCode = require("../../../services/stripe/verify-discount-code");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { type } = event.queryStringParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let partner_plans = [];
    if (type) partner_plans = await database.query("SELECT * from partner_plans where type = $1 AND status = $2", type, "active");
    else partner_plans = await database.query("SELECT * from partner_plans where status = $1", "active");
    if (partner_plans.length) {
      let full_plans = [];
      for (let i = 0; i < partner_plans.length; i++) {
        let plan = partner_plans[i];
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
      "message": "You are not authorized to perform this action."
    })
  };
};
