const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { customer_id, account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const transactions = await database.query(`SELECT DISTINCT ON (t.id)
      t.id,
      t.customer_id,
      t.status,
      t.amount,
      t.failure_message,
      t.type,
      t.receipt_url,
      (case when t.created_at > (CURRENT_DATE - INTERVAL '60 DAY'):: DATE then t.invoice_url end) as invoice_url,
      (case when t.created_at > (CURRENT_DATE - INTERVAL '60 DAY')::DATE then t.invoice_pdf end) as invoice_pdf,
      t.description,
      t.created_at,
      concat(u.first_name, ' ', u.last_name) as name
      FROM transactions t
      JOIN users u ON u.customer_id = t.customer_id
      AND u.status = 'active'
      AND u.version = (SELECT MAX (version) FROM users uu WHERE uu.cognito_id = u.cognito_id)
      WHERE t.customer_id = $1`, customer_id);
    if (transactions.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched customer transactions",
          "payload": transactions
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch customer transactions."
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
