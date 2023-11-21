const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const data = await database.query(`SELECT
      i.*,
      (SELECT
          elements ->> 'category'
        FROM
          system_settings,
          jsonb_array_elements(income_types) elements
        WHERE 
          id = 'system_settings'
          AND elements ->> 'type' = i.income_type) as category,
        (SELECT
          elements ->> 'color'
        FROM
          system_settings,
          jsonb_array_elements(income_types) elements
        WHERE 
          id = 'system_settings'
          AND elements ->> 'type' = i.income_type) as color
      from account_income i
      where i.account_id = $1
      AND i.status = 'active'`, account_id);
    if (data.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched income data.",
          "payload": data
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find income data."
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
