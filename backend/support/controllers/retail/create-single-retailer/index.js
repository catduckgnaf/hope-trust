const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { capitalize } = require("lodash");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { default_generic_features } = require("../../../permissions/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { newRetailer } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const record = await database.queryOne("SELECT * from retailers where LOWER(name) = $1 AND status = 'active'", newRetailer.retailer.name.toLowerCase());
    if (!record) {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2 AND version = (SELECT MAX (version) FROM users where cognito_id = $1 AND status = $2)", newRetailer.retailer.cognito_id, "active");
      const request_wholesalers = newRetailer.retailer.wholesalers || [];
      delete newRetailer.retailer.wholesalers;
      const created_config = await database.insert("benefits_config", { ...newRetailer.benefits_config, cognito_id: newRetailer.retailer.cognito_id });
      const created = await database.insert(
        "retailers", {
          ...newRetailer.retailer,
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
          "permissions": ["basic-user", "retail", "account-admin-view", "account-admin-edit"],
          "status": "active",
          "primary_contact": true,
          "type": "retail",
          "approved": true,
          "version": 1
        }
      );
      if (created) {
        const retailer_record = await database.queryOne(`SELECT DISTINCT on (r.config_id)
            r.*,
            'retail' as type,
            r.cognito_id as account_id,
            bc.signature_id,
            bc.signature_request_id,
            bc.contract_signed,
            bc.contract_signed_on,
            bc.logo,
            u.email,
            u.first_name,
            u.last_name,
            NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as contact_name,
            COALESCE((SELECT array_agg(wc.config_id) from wholesale_connections wc where wc.cognito_id = r.cognito_id AND wc.status = 'pending'), '{}') as pending_wholesalers,
            COALESCE((SELECT array_agg(wc.config_id) from wholesale_connections wc where wc.cognito_id = r.cognito_id AND wc.status = 'active'), '{}') as approved_wholesalers
            from retailers r
            JOIN benefits_config bc on bc.id = r.config_id
            JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
            where r.id = $1 AND r.status = 'active' AND u.status = 'active'`, created.id);
        if (request_wholesalers.length) {
          for (let i = 0; i < request_wholesalers.length; i++) {
            const wholesaler_id = request_wholesalers[i];
            await database.insert("wholesale_connections", { cognito_id: retailer_record.cognito_id, config_id: wholesaler_id, status: "pending" });
            let found_wholesaler = await database.queryOne("SELECT bc.*, w.*, u.email, u.first_name, u.last_name from benefits_config bc JOIN wholesalers w on w.config_id = bc.id JOIN users u on u.cognito_id = w.cognito_id where bc.id = $1 AND w.status = 'active' AND u.status = 'active'", wholesaler_id);
            await sendTemplateEmail(found_wholesaler.email, {
              first_name: capitalize(found_wholesaler.first_name),
              last_name: capitalize(found_wholesaler.last_name),
              template_type: "wholesale_connection_request",
              merge_fields: {
                first_name: capitalize(found_wholesaler.first_name),
                sender_first: retailer_record.first_name,
                sender_last: retailer_record.last_name,
                wholesaler: capitalize(found_wholesaler.name),
                type: "retailer",
                login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
                subject: "Connection Request Received",
                preheader: `${retailer_record.first_name} ${retailer_record.last_name} has requested to connect to your wholesale account, ${capitalize(found_wholesaler.name)}`
              }
            });
          }
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new retailer record.",
            "payload": retailer_record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new retailer record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "An account with this name already exists"
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
