const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { target_account_id, target_cognito_id, updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const oldMembership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", target_cognito_id, target_account_id);
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership.id, { "status": "inactive" });
    if (oldMembershipUpdated) {
      delete oldMembership.id;
      const created = await database.insert(
        "account_memberships", {
          ...oldMembership,
          ...updates,
          "version": oldMembership.version + 1
        }
      );
      if (created) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new membership record",
            "payload": created
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new membership record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update membership."
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
