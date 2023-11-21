const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const all_partner_accounts = await database.query(`SELECT DISTINCT ON (p.cognito_id, a.account_id)
      af.documents,
      af.create_accounts,
      af.billing,
      af.two_factor_authentication,
      af.security_questions,
      af.change_password,
      af.org_export,
      af.permissions,
      af.live_chat,
      af.messaging,
      s.max_cancellations,
      s.additional_seat_cost,
      s.id AS subscription_lookup_id,
      s.account_value,
      a.account_id,
      a.account_name,
      a.hubspot_deal_id,
      a.subscription_id,
      a.plan_id,
      am.referral_code,
      p.signature_request_id,
      p.plan_type,
      p.source,
      p.is_entity,
      p.logo,
      p.approved,
      p.domain_approved,
      p.partner_type,
      p.cognito_id,
      p.name,
      p.contract_signed,
      p.contract_signed_on,
      p.source,
      p.signature_id,
      p.signature_request_id,
      p.created_at,
      p.primary_network,
      p.resident_state_license_number,
      p.npn,
      p.id,
      u.email,
      u.first_name,
      u.last_name,
      concat(u.first_name, ' ', u.last_name) as partner_name,
      u.home_phone,
      u.other_phone,
      u.state,
      u.avatar,
      u.customer_id,
      r.hubspot_company_id,
      u.hubspot_contact_id,
      up.name as plan_name,
      (SELECT string_agg(aa.account_id, ',') from account_memberships aa where aa.cognito_id = p.cognito_id AND aa.account_id != u.cognito_id AND aa.status = 'active') as accounts,
      (SELECT COUNT(*)::int from account_memberships aa where aa.cognito_id = p.cognito_id AND aa.account_id != p.cognito_id AND aa.status = 'active') as count
      from "partners" p
  JOIN users u ON u.cognito_id = p.cognito_id
  AND u.status = 'active'
  AND u.version = (SELECT MAX (version) FROM users where cognito_id = p.cognito_id AND status = 'active')
  LEFT JOIN accounts a ON a.account_id = p.cognito_id AND a.status = 'active'
  LEFT JOIN account_memberships am ON am.account_id = a.account_id AND am.status = 'active'
  LEFT JOIN account_features af ON af.account_id = a.account_id
  LEFT JOIN subscriptions s ON s.subscription_id = a.subscription_id AND s.status = 'active'
  LEFT JOIN partner_plans up ON up.price_id = a.plan_id AND up.status = 'active'
  LEFT JOIN referral_configurations r ON r.name = p.name AND r.status = 'active'
  where p.status = 'active' AND p.version = (SELECT MAX (version) FROM partners where cognito_id = u.cognito_id AND status = 'active')`);
    if (all_partner_accounts.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched all partner accounts",
          "payload": all_partner_accounts
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch all partner accounts."
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
