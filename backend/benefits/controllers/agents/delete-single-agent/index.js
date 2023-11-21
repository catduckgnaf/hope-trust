const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, agent_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    await database.query("DELETE from agents where id = $1", agent_id);
    const agent = await database.query("SELECT * from agents where id = $1", agent_id);
    if (agent.length) {
      return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ success: false, message: "Could not delete agent record." }) };
    } else {
      return { statusCode: 200, headers: getHeaders(), body: JSON.stringify({ success: true, message: "Successfully deleted agent record"}) };
    }
  } else {
    return { statusCode: 401, headers: getHeaders(), body: JSON.stringify({ success: false, message: "You are not authorized to perform this action." }) };
  }
};