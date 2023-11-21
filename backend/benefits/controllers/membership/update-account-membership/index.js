const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser || cognito.isRequestUser) {
    const oldMembership = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND version = (SELECT MAX (version) FROM account_memberships where cognito_id = $1 AND account_id = $2)", cognito.id, account_id);
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership[0].id, { "status": "inactive" });
    if (oldMembershipUpdated) {
      delete oldMembership[0].id;
      const created = await database.insert(
        "account_memberships",
        {
          ...oldMembership[0],
          ...updates,
          "version": oldMembership[0].version + 1
        }
      );
      if (created) {
        const membership = await database.query("SELECT * from account_memberships where id = $1", created);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new membership record",
            "payload": membership[0]
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create new membership record."
          })
        };
      }
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update membership."
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
