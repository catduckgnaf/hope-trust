const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const verifyDiscountCode = require("../../../services/stripe/verify-discount-code");
const { uniqBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { get_all = false } = event.queryStringParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    let account_plans = [];
    let user_plans = [];
    if (get_all === "true") user_plans = await database.query("SELECT * from user_plans where status = 'active'");
    if (!get_all || get_all === "false") user_plans = await database.query("SELECT * from user_plans where account_id IS NULL AND status = 'active'");
    if (account_id) account_plans = await database.query("SELECT * from user_plans where account_id = $1 AND status = 'active'", account_id);
    const all_plans = [...user_plans, ...account_plans];
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
          "message": "Successfully fetched user plans",
          "payload": uniqBy(full_plans, "id")
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
