const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { isThirdPartyAuthorized } = require("../../../permissions/helpers.js");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { organization, type, primary_network, limit } = event.queryStringParameters ? event.queryStringParameters : {};
  if (isThirdPartyAuthorized(event, "TANGO")) {
    let query = "SELECT p.name, p.role, p.title, p.firm_size, p.primary_network, p.chsnc_graduate, p.is_life_insurance_affiliate, p.partner_type, p.is_entity, p.plan_type, p.contract_signed, p.contract_signed_on, p.logo, u.avatar AS user_avatar, u.first_name, u.last_name, u.state, u.home_phone from partners p";
    query += " JOIN users u ON p.cognito_id = u.cognito_id where u.status = 'active' AND p.status = 'active' and p.approved = true";
    if (organization) query += ` AND p.name = '${organization}'`;
    if (type) query += ` AND p.partner_type = '${type}'`;
    if (primary_network) query += ` AND p.primary_network = '${primary_network}'`;
    if (limit) query += ` LIMIT ${limit}`;
    const partners = await database.query(query);
    let partner_organizations = {};
    partners.forEach((partner) => {
      if (partner_organizations[partner.name]) partner_organizations[partner.name].push(partner);
      else partner_organizations[partner.name] = [partner];
    });
    if (Object.values(partner_organizations).length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched partners",
          "payload": partner_organizations
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any partners."
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