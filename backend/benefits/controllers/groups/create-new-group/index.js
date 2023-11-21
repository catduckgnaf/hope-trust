const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { capitalize } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { account, newAccount, temp } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const created_config = await database.insert("benefits_config", { ...account.benefits_config, cognito_id: newAccount.account_id });
    if (!created_config) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create benefits config."
        })
      };
    }
    const created = await database.insert(
      "groups", {
        ...account.group,
        config_id: created_config,
        cognito_id: newAccount.account_id,
        status: "pending"
      }
    );
    if (!created) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new group record."
        })
      };
    }
    await database.insert("group_connections", { cognito_id: account.group.parent_id, config_id: created_config, status: "active" });
    if (account.team.team_assigned) await database.insert("group_connections", { cognito_id: account.team.cognito_id, config_id: created_config, status: "active" });
    const groups = await database.query("SELECT * from groups where id = $1", created);
    if (!groups.length) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find group record."
        })
      };
    }
    const creator = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", account_id);
    await sendTemplateEmail(account.user.email, {
      first_name: capitalize(account.user.first_name),
      last_name: capitalize(account.user.last_name),
      template_type: "new_entity_welcome",
      merge_fields: {
        first_name: capitalize(account.user.first_name),
        login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
        subject: "Welcome to the Hope Trust Benefits Network!",
        preheader: "Your Hope Trust Group was successfully created",
        password: temp,
        type: "Group",
        creator_first: creator[0].first_name,
        creator_last: creator[0].last_name
      }
    });
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched group record.",
        "payload": groups[0]
      })
    };
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
