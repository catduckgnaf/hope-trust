const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const verifyDiscountCode = require("../../../services/stripe/verify-discount-code");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const user_plans = await database.query("SELECT * from user_plans where status = $1", "active");
    if (user_plans.length) {
      let full_plans = [];
      for (let i = 0; i < user_plans.length; i++) {
        let plan = user_plans[i];
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
          "message": "Successfully fetched user plans",
          "payload": full_plans
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any user plans."
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
