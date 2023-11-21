const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const lookupCognitoUser = require("../../../../services/cognito/lookup-cognito-user");
const getExpandedStripeCustomer = require("../../../../services/stripe/get-expanded-customer");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, target_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let customer = { success: false };
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", target_id);
    const primary_membership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", target_id, target_id);
    const type = (primary_membership && ["wholesale", "retail", "agent", "group", "team", "benefits", "advisor", "customer-support"].includes(primary_membership.type)) ? primary_membership.type : "client";
    if (user && user.customer_id) customer = await getExpandedStripeCustomer(user.customer_id);
    const memberships = await database.query(`SELECT DISTINCT on (am.cognito_id, am.account_id)
      am.account_id,
      COALESCE(pp.permissions, up.permissions, '{}') as allowed_permissions,
      u.first_name,
      u.last_name,
      concat(u.first_name, ' ', u.last_name) as name,
      am.permissions,
      am.id
      from account_memberships am
      JOIN users u on u.cognito_id = am.account_id
      JOIN accounts a on a.account_id = am.account_id AND a.status = 'active'
      LEFT JOIN user_plans up on a.plan_id = up.price_id AND up.status = 'active'
      LEFT JOIN partner_plans pp on a.plan_id = pp.price_id AND pp.status = 'active'
      where am.cognito_id = $1
      AND am.status = 'active'
      AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id)`, target_id);
    const cognito_record = await lookupCognitoUser(user.email);
    if (user) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched user",
          "payload": {
            ...user,
            memberships,
            type: (cognito_record.success ? cognito_record.user.type : type),
            cognito_record: cognito_record.success ? cognito_record.user : {},
            customer: customer.success ? customer.customer : false
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
