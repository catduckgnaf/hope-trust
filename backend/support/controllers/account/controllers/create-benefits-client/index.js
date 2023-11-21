const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { account, group, rep, agent, params } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (!["group"].includes(rep.type)) {
      const connection = await database.queryOne("SELECT * from group_connections where cognito_id = $1 AND config_id = $2", rep.cognito_id, group.config_id);
      if (!connection) await database.insert("group_connections", { cognito_id: rep.cognito_id, config_id: group.config_id, status: "active" });
    }
    const url_params = new URLSearchParams(params);
    const signup_url = `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/client-registration?${url_params.toString()}`;
    const created = await database.insert(
      "benefits_client_config", {
        account_id: account.account_id,
        owner_id: rep.cognito_id,
        group_id: group.id,
        agent_id: agent ? agent.id : null,
        invite_code: null,
        invite_first: params.firstname,
        invite_last: params.lastname,
        invite_email: params.email,
        invite_url: signup_url,
        invite_status: "claimed",
        status: "active",
      }
    );
    if (created) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new record.",
          "payload": created
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new record."
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