const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { capitalize } = require("lodash");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { default_generic_features } = require("../../../permissions/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { newAgent } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const record = await database.queryOne("SELECT * from agents where cognito_id = $1 AND status = 'active'", newAgent.agent.cognito_id);
    if (!record) {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active' AND version = (SELECT MAX (version) FROM users where cognito_id = $1 AND status = 'active')", newAgent.agent.cognito_id);
      const request_groups = newAgent.agent.groups || [];
      delete newAgent.agent.groups;
      const created_config = await database.insert("benefits_config", { ...newAgent.benefits_config, cognito_id: newAgent.agent.cognito_id });
      const created = await database.insert(
        "agents", {
          ...newAgent.agent,
          config_id: created_config.id,
          status: "active"
        }
      );
      await database.insert(
        "accounts", {
          "account_name": `${user.first_name} ${user.last_name}`,
          "cognito_id": user.cognito_id,
          "account_id": user.cognito_id,
          "status": "active",
          "version": 1
        }
      );
      await database.insert("account_features", { ...default_generic_features, account_id: user.cognito_id });
      await database.insert(
        "account_memberships", {
          "cognito_id": user.cognito_id,
          "account_id": user.cognito_id,
          "permissions": ["basic-user", "agent", "account-admin-view", "account-admin-edit"],
          "status": "active",
          "primary_contact": true,
          "type": "agent",
          "approved": true,
          "version": 1
        }
      );
      if (created) {
        const agent_record = await database.queryOne(`SELECT DISTINCT on (a.config_id)
              a.*,
              'agent' as type,
              a.cognito_id as account_id,
              bc.signature_id,
              bc.signature_request_id,
              bc.contract_signed,
              bc.contract_signed_on,
              COALESCE((SELECT array_agg(gc.config_id) from group_connections gc where gc.cognito_id = a.cognito_id AND gc.status = 'pending'), '{}') as pending_groups,
              COALESCE((SELECT array_agg(gc.config_id) from group_connections gc where gc.cognito_id = a.cognito_id AND gc.status = 'active'), '{}') as approved_groups,
              (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.owner_id = a.cognito_id AND bcc.status = 'active') as accounts,
              (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.owner_id = a.cognito_id AND bcc.status = 'active') as count,
              bc.logo,
              u.first_name,
              u.last_name,
              u.email,
              NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as contact_name
              from agents a
              JOIN benefits_config bc on bc.id = a.config_id
              JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
              where a.id = $1 AND a.status = 'active' AND u.status = 'active'`, created.id);
        if (request_groups.length) {
          for (let i = 0; i < request_groups.length; i++) {
            const group_id = request_groups[i];
            await database.insert("group_connections", { cognito_id: agent_record.cognito_id, config_id: group_id, status: "pending" });
            let found_group = await database.queryOne("SELECT bc.*, g.*, u.email, u.first_name, u.last_name from benefits_config bc JOIN groups g on g.config_id = bc.id JOIN users u on u.cognito_id = g.cognito_id where bc.id = $1 AND g.status = 'active' AND u.status = 'active'", group_id);
            await sendTemplateEmail(found_group.email, {
              first_name: capitalize(found_group.first_name),
              last_name: capitalize(found_group.last_name),
              template_type: "group_connection_request",
              merge_fields: {
                first_name: capitalize(found_group.first_name),
                sender_first: agent_record.first_name,
                sender_last: agent_record.last_name,
                group: capitalize(found_group.name),
                type: "agent",
                login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
                subject: "Connection Request Received",
                preheader: `${agent_record.first_name} ${agent_record.last_name} has requested to connect to your benefits group, ${capitalize(found_group.name)}`
              }
            });
          }
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new agent record.",
            "payload": agent_record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new agent record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Agent is already active with another retail agency."
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
