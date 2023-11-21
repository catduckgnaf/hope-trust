const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getHelloSignSignatureId = require("../../../services/hello-sign/get-signature-id");
const getHelloSignEmbedURL = require("../../../services/hello-sign/get-embed-url");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { capitalize } = require("lodash");

const tables = {
  wholesale: "wholesalers",
  retail: "retailers",
  agent: "agents",
  group: "groups",
  team: "teams"
};

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { subject, message, signers, signature_id, templates, config, type } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (!signature_id) {
      let request_groups = [];
      let request_wholesalers = [];
      const users = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
      let benefits_config = await database.query("SELECT * from benefits_config where cognito_id = $1", cognito.id);
      if (!benefits_config.length) {
        await database.insert("benefits_config", { cognito_id: cognito.id });
        benefits_config = await database.query("SELECT * from benefits_config where cognito_id = $1", cognito.id);
        if (type === "wholesale") delete config.parent_id;
        if (type === "agent") {
          delete config.name;
          delete config.domains;
        }
        if (config.groups) request_groups = config.groups;
        if (config.wholesalers) request_wholesalers = config.wholesalers;
        delete config.groups;
        delete config.wholesalers;
        await database.insert(tables[type], { ...config, status: "pending", cognito_id: cognito.id, config_id: benefits_config[0].id });
        
        if (type === "agent") config.name = `${users[0].first_name} ${users[0].last_name}`;
        if (type === "group" && config.parent_id !== cognito.id) await database.insert("group_connections", { cognito_id: config.parent_id, config_id: benefits_config[0].id, status: "active" });
        if (["agent", "team"].includes(type)) {
          if (request_groups.length) {
            for (let i = 0; i < request_groups.length; i++) {
              const group_id = request_groups[i];
              await database.insert("group_connections", { cognito_id: cognito.id, config_id: group_id, status: "pending" });
            }
          }
        }
        if (["retail"].includes(type)) {
          if (request_wholesalers.length) {
            for (let i = 0; i < request_wholesalers.length; i++) {
              const wholesale_id = request_wholesalers[i];
              await database.insert("wholesale_connections", { cognito_id: cognito.id, config_id: wholesale_id, status: "pending" });
            }
          }
        }
      }
      const signature_id = await getHelloSignSignatureId(subject, message, signers, templates, benefits_config[0], users[0], config);
      if (signature_id.success) {
        const embed_link = await getHelloSignEmbedURL(signature_id.data.signatures[0].signature_id);
        if (!embed_link.success) {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": embed_link.message
            })
          };
        }
        if (benefits_config.length) await database.updateById("benefits_config", benefits_config[0].id, { signature_request_id: signature_id.data.signature_request_id, signature_id: signature_id.data.signatures[0].signature_id });
        benefits_config = await database.query("SELECT * from benefits_config where cognito_id = $1", cognito.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully fetched signature embed link",
            "payload": { embed_link: embed_link.data, request_id: signature_id.data.signature_request_id, signature_id: signature_id.data.signatures[0].signature_id, benefits_config: benefits_config.length ? benefits_config[0] : null }
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": signature_id.message
          })
        };
      }
    } else {
      const benefits_config = await database.query("SELECT * from benefits_config where cognito_id = $1", cognito.id);
      const embed_link = await getHelloSignEmbedURL(signature_id);
      if (!embed_link.success) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": embed_link.message
          })
        };
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched signature embed link",
          "payload": { embed_link: embed_link.data, benefits_config: benefits_config.length ? benefits_config[0] : null }
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
