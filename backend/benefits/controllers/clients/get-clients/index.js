const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { uniq } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { config_ids, type, parent_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let viable_ids = [account_id];
    switch (type) {
      case "team":
        const team_agents = await database.query("SELECT cognito_id from agents where cognito_id = $1 AND status = 'active'", parent_id);
        if (team_agents.length) viable_ids.push(...team_agents.map((a) => a.cognito_id));
        break;
      case "group":
        const groups_teams = await database.query("SELECT cognito_id from teams where parent_id = $1 AND status = 'active'", account_id);
        if (groups_teams.length) viable_ids.push(...groups_teams.map((t) => t.cognito_id));
        const group_agents = await database.query("SELECT cognito_id from agents where cognito_id = $1 AND status = 'active'", parent_id);
        if (group_agents.length) viable_ids.push(...group_agents.map((a) => a.cognito_id));
        break;
      case "agent":
        const agent_teams = await database.query("SELECT cognito_id from teams where parent_id = $1 AND status = 'active'", account_id);
        if (agent_teams.length) viable_ids.push(...agent_teams.map((t) => t.cognito_id));
        break;
      case "retail":
        const retailer_agents = await database.query("SELECT cognito_id from agents where parent_id = $1 AND status = 'active'", account_id);
        if (retailer_agents.length) {
          viable_ids.push(...retailer_agents.map((t) => t.cognito_id));
          for (let i = 0; i < retailer_agents.length; i++) {
            const retailer_agent_teams = await database.query("SELECT cognito_id from teams where parent_id = $1 AND status = 'active'", retailer_agents[i].cognito_id);
            if (retailer_agent_teams.length) viable_ids.push(...retailer_agent_teams.map((t) => t.cognito_id));
          }
        }
        break;
      case "wholesale":
        const wholesale_account = await database.query("SELECT * from wholesalers where cognito_id = $1 AND status = 'active'", account_id);
        const wholesale_retailers = await database.query("SELECT r.cognito_id from retailers r JOIN wholesale_connections wc ON wc.config_id = $1 where r.status = 'active' AND wc.status = 'active'", wholesale_account[0].config_id);
        if (wholesale_retailers.length) viable_ids.push(...wholesale_retailers.map((t) => t.cognito_id));
        for (let j = 0; j < wholesale_retailers.length; j++) {
          const wholesale_retailer_agents = await database.query("SELECT cognito_id from agents where parent_id = $1 AND status = 'active'", wholesale_retailers[j].cognito_id);
          if (wholesale_retailer_agents.length) {
            viable_ids.push(...wholesale_retailer_agents.map((t) => t.cognito_id));
            for (let i = 0; i < wholesale_retailer_agents.length; i++) {
              const wholesale_retailer_agents_teams = await database.query("SELECT cognito_id from agents where parent_id = $1 AND status = 'active'", wholesale_retailer_agents[i].cognito_id);
              if (wholesale_retailer_agents_teams.length) viable_ids.push(...wholesale_retailer_agents_teams.map((t) => t.cognito_id));
            }
          }
        }
        break;
    }
    let clients = [];
    const unique = uniq(config_ids);
    for (let o = 0; o < unique.length; o++) {
      const config_id = unique[o];
      const client = await database.query(`SELECT DISTINCT ON (a.account_id)
        a.account_id,
        a.plan_id,
        concat(u.first_name, ' ', u.last_name) as account_name,
        g.name as group_name,
        bcc.owner_id,
        COALESCE(s.account_value, 0) as account_value,
        COALESCE(up.name, 'N/A') as plan_name,
        u.cognito_id,
        bcc.created_at,
        COALESCE(NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), ''), t.name, g.name) as name,
        r.name as retailer_name,
        w.name as wholesaler_name,
        g.wholesale_id,
        gc.status as connection
        from benefits_client_config bcc
        LEFT JOIN groups g ON g.config_id = $1
        LEFT JOIN wholesalers w ON w.id = g.wholesale_id AND w.status = 'active'
        LEFT JOIN accounts a ON a.account_id = bcc.account_id
        LEFT JOIN users u ON u.cognito_id = a.account_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = a.account_id AND uu.status = 'active')
        LEFT JOIN subscriptions s ON s.subscription_id = a.subscription_id
        LEFT JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0
        LEFT JOIN account_memberships am ON am.account_id = u.cognito_id
        LEFT JOIN teams t ON t.cognito_id = bcc.owner_id
        LEFT JOIN agents ag ON (ag.cognito_id = bcc.owner_id OR ag.id = bcc.agent_id OR ag.cognito_id = g.parent_id) AND ag.status = 'active'
        LEFT JOIN retailers r ON r.cognito_id = ag.parent_id AND r.status = 'active'
        LEFT JOIN users uu ON uu.cognito_id = ag.cognito_id AND uu.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = ag.cognito_id AND uu.status = 'active')
        LEFT JOIN users uuu ON uuu.cognito_id = t.cognito_id AND uuu.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = t.cognito_id AND uu.status = 'active')
        LEFT JOIN group_connections gc ON gc.config_id = g.config_id AND (t.cognito_id = gc.cognito_id OR ag.cognito_id = gc.cognito_id) AND gc.status = 'active'
        where ((bcc.group_id = g.id AND (bcc.owner_id = ANY($2) OR bcc.agent_id = ag.id)) OR bcc.group_id = g.id)
        AND u.status = 'active'
        AND s.status = 'active'
        AND up.status = 'active'
        AND bcc.status = 'active'
        AND a.status = 'active'`, config_id, viable_ids);
      if (client.length) clients.push(...client);
    }
    if (clients.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched clients.",
          "payload": clients
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find clients."
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
