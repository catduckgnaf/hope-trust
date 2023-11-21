const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const pending_approvals = await database.query(`SELECT DISTINCT on (u.cognito_id, am.account_id)
      am.id,
      u.cognito_id,
      am.account_id as parent_id,
      am.id as membership_id,
      u.first_name,
      u.last_name,
      u.email,
      uu.first_name as requested_first,
      uu.last_name as requested_last,
      uu.email as requested_email,
      NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), '') as requested_name,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as requester_name,
      am.created_at,
      w.name as wholesale_name,
      r.name as retail_name,
      g.name as group_name,
      t.name as team_name,
      NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), '') as agent_name,
      am.type
      from account_memberships am
      JOIN users u on u.cognito_id = am.cognito_id AND u.status = 'active'
      LEFT JOIN users uu on uu.cognito_id = am.account_id AND uu.status = 'active' AND uu.version = (SELECT MAX (version) FROM users uuuu where uuuu.cognito_id = uu.cognito_id)
      LEFT JOIN wholesalers w on w.cognito_id = am.account_id AND w.status = 'active'
      LEFT JOIN retailers r on r.cognito_id = am.account_id AND r.status = 'active'
      LEFT JOIN groups g on g.cognito_id = am.account_id AND g.status = 'active'
      LEFT JOIN teams t on t.cognito_id = am.account_id AND t.status = 'active'
      LEFT JOIN agents a on a.cognito_id = am.account_id AND a.status = 'active'
      LEFT JOIN users uuu on uuu.cognito_id = a.cognito_id AND uuu.status = 'active'
      where am.approved = false
      AND am.status = 'active'
      AND u.version = (SELECT MAX (version) FROM users uuuu where uuuu.cognito_id = u.cognito_id)`);
    if (pending_approvals.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched pending approvals",
          "payload": pending_approvals
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch pending approvals."
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
