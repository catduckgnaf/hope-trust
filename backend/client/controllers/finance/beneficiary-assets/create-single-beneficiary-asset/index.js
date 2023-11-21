const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newFinance } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const created = await database.insert(
      "account_beneficiary_assets", {
        ...newFinance,
        cognito_id,
        account_id,
        "status": "active",
        "version": 1
      }
    );
    if (created) {
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
          AND ab.status = 'active'`, created.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new beneficiary asset record.",
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
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};
