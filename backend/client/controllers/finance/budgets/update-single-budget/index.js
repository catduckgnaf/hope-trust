const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const oldRecord = await database.queryOne("SELECT * from account_budgets where id = $1 AND account_id = $2", id, account_id);
    const oldRecordUpdated = await database.updateById("account_budgets", oldRecord.id, { "status": "inactive" });
    if (oldRecordUpdated) {
      delete oldRecord.id;
      const updated = await database.insert(
        "account_budgets", {
          ...oldRecord,
          ...updates,
          "version": oldRecord.version + 1
        }
      );
      if (updated) {
        const data = await database.queryOne(`SELECT
          ab.*,
          (ab.value * 12) as annual_value
          from account_budgets ab
          where ab.id = $1
          AND ab.status = 'active'`, updated.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new budget record",
            "payload": data
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new budget record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update budget record."
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
