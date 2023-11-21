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
      "account_benefits", {
        ...newFinance,
        cognito_id,
        account_id,
        "status": "active",
        "version": 1
      }
    );
    if (created) {
      const data = await database.queryOne(`SELECT
        i.*,
        (i.value * 12) as annual_value,
        (SELECT
            elements ->> 'category'
          FROM
            system_settings,
            jsonb_array_elements(benefit_types) elements
          WHERE 
            id = 'system_settings'
            AND elements ->> 'type' = i.program_name) as category,
          (SELECT
            elements ->> 'color'
          FROM
            system_settings,
            jsonb_array_elements(benefit_types) elements
          WHERE 
            id = 'system_settings'
            AND elements ->> 'type' = i.program_name) as color
        from account_benefits i
        where i.id = $1
        AND i.status = 'active'`, created.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new benefit record.",
          "payload": data
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new benefit record."
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
