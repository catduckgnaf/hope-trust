const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    await database.query("UPDATE account_memberships SET status = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", "inactive", cognito.id, account_id, "active");
    const isMember = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito.id, account_id, "active");
    if (isMember.length) {
      return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ success: false, message: "Could not delete user." }) };
    } else {
      return { statusCode: 200, headers: getHeaders(), body: JSON.stringify({ success: true, message: "Successfully deleted user" }) };
    }
  } else {
    return { statusCode: 401, headers: getHeaders(), body: JSON.stringify({ success: false, message: "You are not authorized to perform this action." }) };
  }
};
