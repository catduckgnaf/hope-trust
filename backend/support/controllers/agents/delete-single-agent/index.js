const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, agent_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const agent = await database.queryOne("SELECT cognito_id from agents where id = $1", agent_id);
    const deletedAgent = await database.deleteById("agents", agent_id);
    const deletedMemberships = await database.delete("DELETE from account_memberships where cognito_id = $1 AND type = $2", agent.cognito_id, "agent");
    const deletedAccounts = await database.delete("DELETE from account_memberships where account_id = $1 AND type = $2", agent.cognito_id, "agent");
    if ([deletedAgent, deletedMemberships, deletedAccounts].every((deleted) => deleted)) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          success: true,
          message: "Successfully deleted agent records"
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not delete agent record."
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