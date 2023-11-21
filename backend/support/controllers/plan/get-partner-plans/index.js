const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const partner_plans = await database.query(`SELECT
      pp.*,
      (SELECT
        string_agg(a.account_id, ',')
        from subscriptions s
        JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active'
        JOIN partners p on p.cognito_id = a.account_id AND p.status = 'active' AND p.partner_type = pp.type
        where s.price_id = pp.price_id AND s.status = 'active') as account_ids,
      (SELECT
        count(*)::int
        from subscriptions s
        JOIN accounts a on a.subscription_id = s.subscription_id AND a.status = 'active'
        JOIN partners p on p.cognito_id = a.account_id AND p.status = 'active' AND p.partner_type = pp.type
        where s.price_id = pp.price_id AND s.status = 'active') as count
      from partner_plans pp`);
    if (partner_plans.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),  
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched partner plans",
          "payload": partner_plans
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
