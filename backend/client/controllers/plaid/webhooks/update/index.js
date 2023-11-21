const { getHeaders, warm } = require("../../../../utilities/request");
const verifyJWT = require("../../../../services/plaid/verify-webhook-verification-key");
const { handleTransactionsWebhook, itemsHandler, unhandledWebhook } = require("../../../../services/plaid/webhook-handlers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const body = JSON.parse(event.body);
  const token = event.headers["plaid-verification"];
  const verified = await verifyJWT(JSON.stringify(body, null, 2), token);
  if (verified) {
    const handlerBody = { ...body, account_id, cognito_id };
    switch (body.webhook_type) {
      case "TRANSACTIONS":
        const transactions = await handleTransactionsWebhook(handlerBody);
        if (transactions) {
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Transactions webhook acknowledged."
            })
          };
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Transactions webhook acknowledged."
          })
        };
      case "ITEM":
        const items = await itemsHandler(handlerBody);
        if (items) {
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Item webhook acknowledged."
            })
          };
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Item webhook acknowledged."
          })
        };
      default: unhandledWebhook(handlerBody);
    }
  }
  return {
    statusCode: 403,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "Unauthorized"
    })
  };
};

