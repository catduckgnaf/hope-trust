const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const all_accounts = await database.query(`select DISTINCT ON (accounts.account_id)
      accounts.*,
      s.additional_seat_cost,
      s.id AS subscription_lookup_id,
      bcc.owner_id as benefits_parent,
      bcc.agent_id as agent_owned,
      s.customer_id as subscription_customer_id,
      u.customer_id,
      s.account_value,
      u.first_name,
      u.last_name,
      u.state,
      concat(u.first_name, ' ', u.last_name) as name,
      concat(pu.first_name, ' ', pu.last_name) as partner_name,
      pu.cognito_id as partner_account_id,
      uuu.first_name as group_contact_first,
      uuu.last_name as group_contact_last,
      uuu.email as group_contact_email,
      g.name as group_name,
      r.name as retailer_name,
      w.name as wholesaler_name,
      t.name as team_name,
      uuuuu.first_name as agent_first_name,
      uuuuu.last_name as agent_last_name,
      NULLIF(TRIM(concat(uuuuu.first_name, ' ', uuuuu.last_name)), '') as agent_name,
      g.config_id as group_id,
      a.config_id as agent_id,
      r.config_id as retailer_id,
      w.config_id as wholesaler_id,
      t.config_id as team_id,
      g.cognito_id as group_cognito_id,
      a.cognito_id as agent_cognito_id,
      r.cognito_id as retailer_cognito_id,
      w.cognito_id as wholesaler_cognito_id,
      t.cognito_id as team_cognito_id,
      af.in_app_purchases,
      af.document_generation,
      af.contact_options,
      af.surveys,
      af.documents,
      af.medications,
      af.schedule,
      af.finances,
      af.create_accounts,
      af.trust,
      af.care_coordination,
      af.relationships,
      af.providers,
      af.billing,
      af.two_factor_authentication,
      af.permissions,
      af.security_questions,
      af.partner_conversion,
      af.change_password,
      af.live_chat,
      af.messaging,
      af.bank_account_linking,
      am.type,
      up.name as plan_name,
      (SELECT COUNT(*)::int from account_memberships aa where aa.account_id = accounts.account_id AND aa.status = 'active' AND not (aa.type = any($1)) OR aa.account_id = accounts.account_id AND aa.status = 'active' AND aa.type IS NULL) as count
      from "accounts"
  LEFT JOIN account_features af ON af.account_id = accounts.account_id
  LEFT JOIN subscriptions s ON s.subscription_id = accounts.subscription_id AND s.status = 'active'
  LEFT JOIN users pu ON pu.customer_id = s.customer_id AND s.status = 'active' AND EXISTS (SELECT * FROM partners p where p.cognito_id = pu.cognito_id AND pu.status = 'active')
  LEFT JOIN user_plans up ON up.price_id = accounts.plan_id AND up.status = 'active'
  LEFT JOIN benefits_client_config bcc ON bcc.account_id = accounts.account_id
  LEFT JOIN groups g ON g.id = bcc.group_id AND g.status = 'active'
  LEFT JOIN agents a ON (a.cognito_id = bcc.owner_id OR a.id = bcc.agent_id) AND a.status = 'active'
  LEFT JOIN retailers r ON r.cognito_id = a.parent_id AND r.status = 'active'
  LEFT JOIN wholesalers w ON w.id = g.wholesale_id AND w.status = 'active'
  LEFT JOIN teams t ON t.cognito_id = bcc.owner_id AND t.status = 'active'
  LEFT JOIN users uuu ON uuu.cognito_id = g.cognito_id AND uuu.version = (SELECT MAX (version) FROM users uuuu where uuuu.cognito_id = g.cognito_id AND uuuu.status = 'active')
  LEFT JOIN users uuuuu ON uuuuu.cognito_id = a.cognito_id AND uuuuu.version = (SELECT MAX (version) FROM users uuuuuu where uuuuuu.cognito_id = a.cognito_id AND uuuuuu.status = 'active')
  JOIN account_memberships am ON am.cognito_id = accounts.cognito_id
  JOIN users u ON u.cognito_id = accounts.account_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = accounts.account_id)
  AND NOT EXISTS (SELECT * FROM partners p WHERE p.cognito_id = u.cognito_id)
  AND NOT (am.type = any($1) OR am.type IS NULL)
  AND am.status = 'active'
  AND accounts.status = 'active'
  AND u.status = 'active'`, '{"customer-support", "wholesale", "retail", "agent", "group", "team"}');
    if (all_accounts.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched all accounts",
          "payload": all_accounts
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch all accounts."
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
