const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const user_plans = await database.query(`SELECT DISTINCT ON (up.id)
      up.*,
      (SELECT
        string_agg(a.account_id, ',')
        from subscriptions s
        JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active'
        where s.price_id = up.price_id AND s.status = 'active') as account_ids,
      (SELECT
        count(*)::int
        from subscriptions s
        JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active'
        where s.price_id = up.price_id AND s.status = 'active') as count
      from user_plans up`);
    if (user_plans.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched user plans",
          "payload": user_plans
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
