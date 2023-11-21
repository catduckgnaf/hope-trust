const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const data = await database.query(`
      SELECT DISTINCT ON (u.plaid_item_id, ab.plaid_account_id)
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
      where ab.account_id = $1
      AND ab.status = 'active'`, account_id);
    if (data.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched beneficiary assets data.",
          "payload": data
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find beneficiary assets data."
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
