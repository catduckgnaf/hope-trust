const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const oldRecord = await database.queryOne("SELECT * from account_grantor_assets where id = $1", id);
    const oldRecordUpdated = await database.updateById("account_grantor_assets", oldRecord.id, { "status": "inactive" });
    if (oldRecordUpdated) {
      delete oldRecord.id;
      const updated = await database.insert(
        "account_grantor_assets", {
          ...oldRecord,
          ...updates,
          "version": oldRecord.version + 1
        }
      );
      if (updated) {
        const record = await database.queryOne(`
          SELECT
          ag.*,
          u.status as bank_status,
          u.access_token,
          (SELECT
            elements ->> 'category'
          FROM
            system_settings,
            jsonb_array_elements(asset_types) elements
          WHERE 
            id = 'system_settings'
            AND elements ->> 'type' = ag.account_type) as category,
          (SELECT
            elements ->> 'color'
          FROM
            system_settings,
            jsonb_array_elements(asset_types) elements
          WHERE 
            id = 'system_settings'
            AND elements ->> 'type' = ag.account_type) as color
          from account_grantor_assets ag
          LEFT JOIN user_bank_accounts u on u.plaid_item_id = ag.plaid_item_id AND u.version = (SELECT MAX (version) FROM user_bank_accounts ub where ub.plaid_item_id = ag.plaid_item_id)
          where ag.id = $1
          AND ag.status = 'active'`, updated.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new grantor asset record",
            "payload": record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new grantor asset record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update grantor asset record."
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
