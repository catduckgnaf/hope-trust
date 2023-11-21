const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const removePlaidItem = require("../../../../services/plaid/remove-plaid-item");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, id } = event.pathParameters;
  const { plaid_item_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (plaid_item_id) {
      const item = await database.queryOne("SELECT * from user_bank_accounts where plaid_item_id = $1 AND status = 'active'", plaid_item_id);
      if (item) {
        const remaining_accounts = await database.query("SELECT * from account_grantor_assets where plaid_item_id = $1 AND status = 'active'", plaid_item_id);
        if (remaining_accounts.length === 1) {
          const removed = await database.updateById("user_bank_accounts", item.id, { status: "inactive" });
          if (removed) {
            const removedPlaidItem = await removePlaidItem(item.access_token);
            if (!removedPlaidItem.success) {
              return {
                statusCode: 400,
                headers: getHeaders(),
                body: JSON.stringify({
                  success: false,
                  message: "Could not delete beneficiary asset record."
                })
              };
            }
          }
        }
      }
    }
    const updated_record = await database.updateById("account_grantor_assets", id, { status: "inactive" });
    if (updated_record) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully deleted grantor asset record"
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not delete grantor asset record."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You are not authorized to perform this action."
    })
  };
};