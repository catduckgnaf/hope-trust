const { database } = require("../../../../postgres");
const { getHeaders, warm, extractJSON } = require("../../../../utilities/request");

const training_required = ["insurance"];

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const base64_body = new Buffer.from(event.body, "base64").toString();
  const parsed_body = extractJSON(base64_body);
  const parsed_event = parsed_body[0].event;
  const metadata = parsed_event.event_metadata;
  const signature_request = parsed_body[0].signature_request;
  let partner;
  let benefits;
  if (metadata.related_signature_id) partner = await database.queryOne("SELECT * from partners where signature_id = $1 AND status = $2", metadata.related_signature_id, "active");
  if (!partner && signature_request) partner = await database.queryOne("SELECT * from partners where signature_request_id = $1 AND status = $2", signature_request.signature_request_id, "active");
  if (!partner) {
    if (metadata.related_signature_id) benefits = await database.queryOne("SELECT * from benefits_config where signature_id = $1", metadata.related_signature_id);
    if (!benefits && signature_request) benefits = await database.queryOne("SELECT * from benefits_config where signature_request_id = $1", signature_request.signature_request_id);
  }
  switch (parsed_event.event_type) {
    case "signature_request_viewed":
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    case "signature_request_sent":
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    case "signature_request_signed":
      let signed_updates = { contract_signed: true, contract_signed_on: new Date().toISOString() };
      if (partner) {
        const partner_type = partner.partner_type;
        if (!training_required.includes(partner_type)) signed_updates.approved = true;
        await database.updateById("partners", partner.id, signed_updates);
        if (partner.is_entity) await database.update("account_features", { org_export: true }, { account_id: partner.cognito_id });
      } else if (benefits) {
        await database.updateById("benefits_config", benefits.id, signed_updates);
        await database.update("account_features", { org_export: true }, { account_id: benefits.cognito_id });
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    case "signature_request_all_signed":
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    case "signature_request_downloadable":
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    case "signature_request_canceled":
      let canceled_updates = { contract_signed: false, contract_signed_on: null, signature_id: null, signature_request_id: null };
      if (partner) {
        canceled_updates.approved = false;
        canceled_updates.plan_type = null;
        await database.updateById("partners", partner.id, canceled_updates);
      } else if (benefits) {
        await database.updateById("benefits_config", benefits.id, signed_updates);
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    case "signature_request_remind":
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    case "unknown_error":
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
    default:
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: "Hello API Event Received"
      };
  }
};

