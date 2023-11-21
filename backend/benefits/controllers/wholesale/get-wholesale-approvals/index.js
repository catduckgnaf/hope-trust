const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, wholesale_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const wholesale_approvals = await database.query(`SELECT DISTINCT ON (w.config_id, wc.cognito_id)
    wc.*,
    u.first_name,
    u.last_name,
    u.email,
    r.name as retailer_name,
    w.name,
    am.type
    from wholesale_connections wc
    JOIN users u on u.cognito_id = wc.cognito_id
    LEFT JOIN account_memberships am on am.account_id = wc.cognito_id
    LEFT JOIN wholesalers w on w.config_id = wc.config_id AND w.status = 'active'
    LEFT JOIN retailers r on r.cognito_id = wc.cognito_id AND r.status = 'active'
    where wc.config_id = $3 AND wc.status = ANY($2)
    AND ((am.type = ANY($1) AND am.status = 'active') OR am.type IS NULL)
    AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id)`, ["retail"], ["pending", "active", "declined"], wholesale_id);
    if (wholesale_approvals.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched pending approvals",
          "payload": wholesale_approvals
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not fetch pending approvals."
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
