const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { capitalize } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newRetailer } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    let config_id;
    let id;
    delete newRetailer.wholesalers;
    let created_config = await database.query("SELECT * from benefits_config where cognito_id = $1", cognito_id);
    let existing_record = await database.query("SELECT * from retailers where cognito_id = $1", cognito_id);
    if (created_config.length) config_id = created_config[0].id;
    if (!created_config.length) {
      created_config = await database.insert("benefits_config", { cognito_id });
      config_id = created_config;
    }
    if (!existing_record.length) {
      const created = await database.insert(
        "retailers", {
        ...newRetailer,
        config_id,
        cognito_id,
        status: "active"
      }
      );
      if (!created) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create new retailer record."
          })
        };
      }
      id = created;
    }
    if (existing_record.length) id = existing_record[0].id;
    await database.updateById("retailers", id, { status: "active" });
    const retailers = await database.query(`SELECT
          r.*,
          bc.signature_id,
          bc.signature_request_id,
          bc.contract_signed,
          bc.contract_signed_on,
          bc.logo,
          u.first_name,
          u.last_name from retailers r
          JOIN users u on u.cognito_id = r.cognito_id
          JOIN benefits_config bc on bc.id = r.config_id
          where r.id = $1 AND r.status = 'active' and u.status = 'active'`, id);
    if (!retailers.length) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find retailer record."
        })
      };
    }
    const request_wholesalers = await database.query("SELECT * from wholesale_connections where cognito_id = $1 AND status = 'pending'", cognito_id);
    if (request_wholesalers.length) {
      let user = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", cognito_id);
      for (let i = 0; i < request_wholesalers.length; i++) {
        const wholesaler = request_wholesalers[i];
        let found_wholesaler = await database.query("SELECT bc.*, w.*, u.email, u.first_name, u.last_name from benefits_config bc JOIN wholesalers w on w.config_id = bc.id JOIN users u on u.cognito_id = w.cognito_id where bc.id = $1 AND w.status = 'active' AND u.status = 'active'", wholesaler.config_id);
        await sendTemplateEmail(found_wholesaler[0].email, {
          first_name: capitalize(found_wholesaler[0].first_name),
          last_name: capitalize(found_wholesaler[0].last_name),
          template_type: "wholesale_connection_request",
          merge_fields: {
            first_name: capitalize(found_wholesaler[0].first_name),
            sender_first: user[0].first_name,
            sender_last: user[0].last_name,
            wholesaler: capitalize(found_wholesaler[0].name),
            type: "retailer",
            login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
            subject: "Connection Request Received",
            preheader: `${user[0].first_name} ${user[0].last_name} has requested to connect to your wholesale account, ${capitalize(found_wholesaler[0].name)}`
          }
        });
      }
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched retailer record.",
        "payload": retailers[0]
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