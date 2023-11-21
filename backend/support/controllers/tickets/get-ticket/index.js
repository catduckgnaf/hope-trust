const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { ticket_id, account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const record = await database.queryOne(`SELECT DISTINCT on (sr.id)
      sr.*,
      u.first_name as creator_first,
      u.last_name as creator_last,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as creator_name,
      uu.first_name as account_first,
      uu.last_name as account_last,
      NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), '') as account_name,
      uuu.first_name as assignee_first,
      uuu.last_name as assignee_last,
      NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), '') as assignee_name,
      up.price_id as user_price_id,
      up.name as user_plan_name,
      upp.price_id as partner_price_id,
      upp.name as partner_plan_name
      from service_requests sr
      JOIN users u on u.cognito_id = sr.cognito_id
      JOIN users uu on uu.cognito_id = sr.account_id
      LEFT JOIN users uuu on uuu.cognito_id = sr.assignee
      JOIN accounts a on a.account_id = uu.cognito_id
      LEFT JOIN partner_plans upp on upp.price_id = a.plan_id
      LEFT JOIN user_plans up on up.price_id = a.plan_id
      where u.status = 'active'
      AND uu.status = 'active'
      AND a.status = 'active' AND sr.id = $1`, ticket_id);
    if (record.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched ticket record",
          "payload": record
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch ticket record."
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