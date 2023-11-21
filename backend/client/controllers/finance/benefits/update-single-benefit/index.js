const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const oldRecord = await database.queryOne("SELECT * from account_benefits where id = $1 AND account_id = $2", id, account_id);
    const oldRecordUpdated = await database.updateById("account_benefits", oldRecord.id, { "status": "inactive" });
    if (oldRecordUpdated) {
      delete oldRecord.id;
      const updated = await database.insert(
        "account_benefits", {
          ...oldRecord,
          ...updates,
          "version": oldRecord.version + 1
        }
      );
      if (updated) {
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
          AND i.status = 'active'`, updated.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new benefit record",
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
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update benefit record."
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
