const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const oldRecord = await database.queryOne("SELECT * from myto_simulations where id = $1 AND account_id = $2", id, account_id);
    if (updates.default_simulation) await database.update("myto_simulations", { default_simulation: false }, { account_id, status: "active" });
    const oldRecordUpdated = await database.updateById("myto_simulations", oldRecord.id, { "status": "inactive" });
    if (oldRecordUpdated) {
      delete oldRecord.id;
      const updated = await database.insert(
        "myto_simulations", {
          ...oldRecord,
          ...updates,
          "version": oldRecord.version + 1
        }
      );
      if (updated) {
        const data = await database.queryOne(`SELECT
          ms.*,
          (ms.final_average_without_benefits - ms.final_average) as replacement_cost
          from myto_simulations ms
          where ms.id = $1
          AND ms.status = 'active'`, updated.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new myto simulations",
            "payload": data
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new myto simulations."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update myto simulations."
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
