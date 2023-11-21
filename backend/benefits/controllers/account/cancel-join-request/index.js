const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { cognito_id, account_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const oldMembership = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", cognito_id, account_id);
    if (oldMembership.length) {
      const deleted = await database.query("DELETE from account_memberships where id = $1", oldMembership[0].id);
      const membership = await database.query("SELECT * from account_memberships where id = $1", oldMembership[0].id);
      if (!membership.length) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully cancelled join request."
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not cancel join request."
          })
        };
      }
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "User is not a pending member of this account."
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
