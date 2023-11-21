const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { getPrefix } = require("../../../utilities/helpers");
const { generateCodeDigits } = require("../../../services/stripe/utilities");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  let { account, group, rep, agent, params = {} } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  const url_params = new URLSearchParams(params);
  if (cognito.isAuthorized) {
    if (account.invite_code && account.invite_code === "pending") {
      const found_group = await database.query("SELECT name from groups where id = $1", group.id);
      if (found_group.length) {
        const temp_code = `${getPrefix(found_group[0].name)}_${generateCodeDigits()}`;
        const is_taken = await database.query("SELECT invite_code from benefits_client_config where invite_code = $1", temp_code);
        if (!is_taken.length) {
          account.invite_code = temp_code;
          url_params.append("invite_code", temp_code);
        }
      }
    }
    const signup_url = `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/client-registration?${url_params.toString()}`;
    const created = await database.insert(
      "benefits_client_config", {
        account_id: account.account_id,
        owner_id: rep.cognito_id,
        group_id: group.id,
        agent_id: agent ? agent.id : null,
        invite_first: params.firstname,
        invite_last: params.lastname,
        invite_email: params.email,
        invite_url: signup_url,
        invite_code: account.invite_code || null,
        invite_status: (account.status === "pending") ? "sent" : "claimed",
        status: account.status || "active"
      }
    );
    if (created) {
      const config = await database.query("SELECT * from benefits_client_config where id = $1", created);
      if (!config.length) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not find created record."
          })
        };
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new record.",
          "payload": { ...config[0], signup_url }
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new record."
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