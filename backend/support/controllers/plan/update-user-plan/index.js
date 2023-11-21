const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getProductPrice = require("../../../services/stripe/get-product-price");
const { convertArray } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { plan_id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const is_stripe_price = await getProductPrice(updates.price_id);
    if (is_stripe_price.success) {
      const updated = await database.updateById("user_plans", plan_id, { ...updates, permissions: convertArray(updates.permissions), features: JSON.stringify(updates.features) });
      if (updated) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated user plan",
            "payload": updated
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update user plan."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": is_stripe_price.message
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
