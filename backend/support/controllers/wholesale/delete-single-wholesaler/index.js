const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, wholesaler_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const wholesaler = await database.queryOne("SELECT cognito_id from wholesalers where id = $1", wholesaler_id);
    const deletedWholesaler = await database.deleteById("wholesalers", wholesaler_id);
    const deletedMemberships = await database.delete("DELETE from account_memberships where cognito_id = $1 AND type = $2", wholesaler.cognito_id, "wholesaler");
    const deletedAccounts = await database.delete("DELETE from account_memberships where account_id = $1 AND type = $2", wholesaler.cognito_id, "wholesaler");
    if ([deletedWholesaler, deletedMemberships, deletedAccounts].every((deleted) => deleted)) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully deleted wholesaler records"
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not delete wholesaler record."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You are not authorized to perform this action."
    })
  };
};