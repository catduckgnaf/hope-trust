const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const oldRecord = await database.queryOne("SELECT * from account_income where id = $1 AND account_id = $2", id, account_id);
    const oldRecordUpdated = await database.updateById("account_income", oldRecord.id, { "status": "inactive" });
    if (oldRecordUpdated) {
      delete oldRecord.id;
      const updated = await database.insert(
        "account_income", {
          ...oldRecord,
          ...updates,
          "version": oldRecord.version + 1
        }
      );
      if (updated) {
        const data = await database.queryOne(`SELECT
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
          where i.id = $1
          AND i.status = 'active'`, updated.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new income record",
            "payload": data
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new income record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update income record."
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
