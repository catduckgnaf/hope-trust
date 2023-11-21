const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const oldRecord = await database.queryOne("SELECT * from account_beneficiary_assets where id = $1 AND account_id = $2", id, account_id);
    const oldRecordUpdated = await database.updateById("account_beneficiary_assets", oldRecord.id, { "status": "inactive" });
    if (oldRecordUpdated) {
      delete oldRecord.id;
      const updated = await database.insert(
        "account_beneficiary_assets", {
          ...oldRecord,
          ...updates,
          "version": oldRecord.version + 1
        }
      );
      if (updated) {
        const record = await database.queryOne(`
          SELECT
          ab.*,
          (ab.value - COALESCE(ab.debt, 0)) as net_value,
          u.status as bank_status,
          u.access_token,
          (SELECT
            elements ->> 'category'
          FROM
            system_settings,
            jsonb_array_elements(asset_types) elements
          WHERE 
            id = 'system_settings'
            AND elements ->> 'type' = ab.account_type) as category,
          (SELECT
            elements ->> 'color'
          FROM
            system_settings,
            jsonb_array_elements(asset_types) elements
          WHERE 
            id = 'system_settings'
            AND elements ->> 'type' = ab.account_type) as color
          from account_beneficiary_assets ab
          LEFT JOIN user_bank_accounts u on u.plaid_item_id = ab.plaid_item_id AND u.version = (SELECT MAX (version) FROM user_bank_accounts ub where ub.plaid_item_id = ab.plaid_item_id)
          where ab.id = $1
          AND ab.status = 'active'`, updated.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new beneficiary asset record",
            "payload": record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new beneficiary asset record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update beneficiary asset record."
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