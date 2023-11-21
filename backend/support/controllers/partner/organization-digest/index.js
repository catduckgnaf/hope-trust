const { database } = require("../../../postgres");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { getHeaders, warm } = require("../../../utilities/request");
const { capitalize } = require("../../../utilities/helpers");
const moment = require("moment");

const advisor_types = [
  { name: "law", alias: "Law Firm" },
  { name: "bank_trust", alias: "Bank or Trust Company" },
  { name: "insurance", alias: "Insurance" },
  { name: "ria", alias: "Investment Advisor" },
  { name: "healthcare", alias: "Healthcare Provider" },
  { name: "accountant", alias: "Accountant" },
  { name: "advocate", alias: "Community Advocate" },
  { name: "education", alias: "Education" },
  { name: "other", alias: "Other" }
];

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { organization } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (organization) {
      let final_accounts = [];
      const referral = await database.queryOne("SELECT r.domains from referral_configurations r where r.name = $1", capitalize(organization));
      const partners = await database.query("SELECT DISTINCT ON (cognito_id) p.*, am.referral_code, u.email, u.first_name, u.last_name, u.home_phone from partners p JOIN account_memberships am ON am.account_id = p.cognito_id AND am.status = $1 JOIN users u ON u.cognito_id = p.cognito_id AND u.status = $1 where p.status = $1", "active");

      for (let i = 0; i < partners.length; i++) {
        const partner = partners[i];
        if (!partner) continue;
        const found_org = partner.name.toLowerCase().includes(organization);
        const found_primary = (partner.primary_network || "").toLowerCase().includes(organization);
        const found_referral = referral ? referral.domains.includes(partner.email.split("@")[1]) : false;
        if (!found_org && !found_primary && !found_referral) continue;

        const memberships = await database.query("SELECT DISTINCT ON (account_id) am.account_id, af.trust, u.first_name, u.last_name, u.status, u.created_at AS user_created from account_memberships am JOIN account_features af ON af.account_id = am.account_id JOIN users u ON u.cognito_id = am.account_id AND u.status = 'active' where am.account_id != $1 AND am.cognito_id = $1 AND am.status = 'active'", partner.cognito_id);
        let the_account = {
          name: `${partner.first_name} ${partner.last_name}`,
          created: moment(partner.created_at).format("MM/DD/YYYY"),
          contact_email: partner.email,
          contact_number: partner.home_phone ? partner.home_phone : "No phone",
          organization: partner.name,
          primary_network: partner.primary_network,
          partner_type: advisor_types.find((p) => p.name === partner.partner_type).alias,
          plan_type: partner.plan_type || "N/A",
          contract_signed: partner.contract_signed,
          referral_code: partner.referral_code,
          approved: partner.approved,
          clients_number: memberships.length,
          clients: []
        };
        for (let i = 0; i < memberships.length; i++) {
          const membership = memberships[i];
          const account_plan = await database.queryOne("SELECT a.plan_id, up.name from accounts a JOIN user_plans up ON a.plan_id = up.price_id where a.status = 'active'");
          the_account.clients.push({
            client_first: membership.first_name,
            client_last: membership.last_name,
            client_created: moment(membership.user_created).format("MM/DD/YYYY"),
            plan: account_plan.length ? account_plan.name : "None",
            trust: membership.trust ? "Yes" : "No",
            advisor_name: `${partner.first_name} ${partner.last_name}`
          });
        }
        final_accounts.push(the_account);
      }
      if (!final_accounts.length) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": `Could not generate an org export for ${organization}.`
          })
        };
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully generated organization export.",
          "payload": final_accounts
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You must supply an organization."
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

