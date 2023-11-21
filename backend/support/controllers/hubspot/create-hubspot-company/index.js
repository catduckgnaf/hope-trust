const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { getPrefix, WEBMAIL_PROVIDER_DOMAINS } = require("../../../utilities/helpers");
const { default_user_features } = require("../../../permissions/helpers");
const createHubspotCompany = require("../../../services/hubspot/create-hubspot-company");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { cognito_id } = event.pathParameters;
  let { data, type, name, domain_approved, email } = JSON.parse(event.body);
  const domain = email.split("@")[1];
  if (domain_approved && domain) data.push({ name: "domain", value: domain });
  const existing_company = await database.queryOne("SELECT * from referral_configurations where name = $1", name);
  if (!existing_company) {
    const company = await createHubspotCompany(data);
    if (!company.success) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": company.message
        })
      };
    }
    await database.insert(
      "referral_configurations", {
        cognito_id,
        name,
        type,
        "prefix": getPrefix(name),
        "domains": (domain_approved && !WEBMAIL_PROVIDER_DOMAINS.includes(domain)) ? [domain] : [],
        "percent_off": 20,
        "duration": "once",
        "new_accounts": true,
        "myto_allowed": ["ria", "accountant", "bank_trust", "insurance", "law"].includes(type),
        "features": Object.keys(default_user_features).filter((key) => default_user_features[key]),
        "hubspot_company_id": company.data.companyId,
        "status": (domain_approved && !WEBMAIL_PROVIDER_DOMAINS.includes(domain)) ? "active" : "inactive"
      }
    );
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": company.message,
        "payload": company.data
      })
    };
  }
  return {
    statusCode: 200,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": true,
      "message": "Existing company record found.",
      "payload": {
        companyId: existing_company.hubspot_company_id,
        type: existing_company.type
      }
    })
  };
};
