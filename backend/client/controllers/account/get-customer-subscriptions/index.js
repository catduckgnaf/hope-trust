const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { customer_id, account_id, cognito_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const subscriptions = await database.query(`select DISTINCT ON (subscription_id, status)
      s.*,
      amp.id AS membership_id,
      a.account_name,
      a.account_id,
      u.customer_id AS transfer_customer_id,
      u.cognito_id AS transfer_cognito_id,
      u.first_name,
      u.last_name,
      COALESCE(up.name, pp.name) as plan_name
      from subscriptions s
      JOIN accounts a ON a.subscription_id = s.subscription_id AND a.status = 'active'
      JOIN account_memberships am ON am.account_id = a.account_id AND am.status = 'active' AND am.linked_account IS NOT TRUE
      JOIN users u ON u.cognito_id = am.cognito_id AND u.status = 'active' AND u.customer_id IS NOT NULL
      LEFT JOIN partners p on p.cognito_id = u.cognito_id AND p.status = 'active'
      LEFT JOIN account_memberships amp ON amp.cognito_id = $2 AND amp.account_id = a.account_id AND amp.status = 'active'
      LEFT JOIN user_plans up ON up.price_id = s.price_id AND up.status = 'active'
      LEFT JOIN partner_plans pp ON pp.price_id = s.price_id AND pp.status = 'active' AND pp.type = p.partner_type
      where s.customer_id = $1`, customer_id, cognito_id);
    if (subscriptions.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched customer subscriptions",
          "payload": {
            active: subscriptions.filter((s) => s.status === "active"),
            inactive: subscriptions.filter((s) => s.status === "inactive"),
            cancelled: subscriptions.filter((s) => s.status === "cancelled"),
            transferred: subscriptions.filter((s) => s.status === "transferred")
          }
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch customer subscriptions."
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
