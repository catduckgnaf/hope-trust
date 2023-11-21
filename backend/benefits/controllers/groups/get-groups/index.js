const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { uniq } = require("lodash");
const { uniqBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { type, config_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  let groups = [];
  if (cognito.isAuthorized) {
    if (["wholesale", "retail", "agent", "team"].includes(type)) {
      let cognito_ids = [];
      if (type === "team") {
        cognito_ids.push(account_id);
        const agents = await database.query("SELECT a.cognito_id FROM benefits_client_config bcc JOIN agents a ON a.id = bcc.agent_id WHERE bcc.owner_id = $1 AND a.status = 'active' AND bcc.status = 'active'", account_id);
        const team_agents = agents.map((at) => at.cognito_id);
        if (team_agents.length) cognito_ids.push(...team_agents);
      }
      if (type === "agent") {
        cognito_ids.push(account_id);
        const teams = await database.query("SELECT cognito_id FROM teams WHERE parent_id = $1 AND status = 'active'", account_id);
        const agents_teams = teams.map((at) => at.cognito_id);
        if (agents_teams.length) cognito_ids.push(...agents_teams);
      }
      if (type === "retail") {
        let teams = [];
        const agents = await database.query("SELECT cognito_id FROM agents WHERE parent_id = $1 AND status = 'active'", account_id);
        for (let i = 0; i < agents.length; i++) {
          teams = await database.query("SELECT cognito_id FROM teams WHERE parent_id = $1 AND status = 'active'", agents[i].cognito_id);
        }
        const agents_teams = [...agents, ...teams].map((at) => at.cognito_id);
        if (agents_teams.length) cognito_ids.push(...agents_teams);
      }
      if (type === "wholesale") {
        let teams = [];
        let agents = [];
        const retailers = await database.query("SELECT cognito_id FROM wholesale_connections WHERE config_id = $1 AND status = 'active'", config_id);
        for (let j = 0; j < retailers.length; j++) {
          agents = await database.query("SELECT cognito_id FROM agents WHERE parent_id = $1 AND status = 'active'", retailers[j].cognito_id);
          for (let i = 0; i < agents.length; i++) {
            teams = await database.query("SELECT cognito_id FROM teams WHERE parent_id = $1 AND status = 'active'", agents[i].cognito_id);
          }
        }
        const agents_teams = [...agents, ...teams].map((at) => at.cognito_id);
        if (agents_teams.length) cognito_ids.push(...agents_teams);
      }
      cognito_ids = uniq(cognito_ids);
      for (let i = 0; i < cognito_ids.length; i++) {
        const found_groups = await database.query(`SELECT DISTINCT on (g.config_id)
          g.*,
          u.first_name,
          u.last_name,
          COALESCE((SELECT array_agg(ac.type) from group_connections gc JOIN account_memberships ac ON ac.account_id = gc.cognito_id AND ac.status = 'active' where gc.config_id = g.config_id AND gc.status = 'pending'), '{}') as pending_groups,
          COALESCE((SELECT array_agg(ac.type) from group_connections gc JOIN account_memberships ac ON ac.account_id = gc.cognito_id AND ac.status = 'active' where gc.config_id = g.config_id AND gc.status = 'active'), '{}') as approved_groups,
          (SELECT
            COUNT(*)::int
            from benefits_client_config bcc
            JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
            JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
            JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
            where bcc.group_id = g.id AND bcc.status = 'active'
            AND bcc.status = 'active'
          ) as count,
          (SELECT
            COALESCE(SUM(up.monthly), 0)::int
            from benefits_client_config bcc
            JOIN accounts a on a.account_id = bcc.account_id
            JOIN subscriptions s ON s.subscription_id = a.subscription_id AND s.status = 'active'
            JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
            where bcc.group_id = g.id AND bcc.status = 'active'
            AND bcc.status = 'active'
          ) as revenue
          from group_connections gc
          JOIN groups g on g.config_id = gc.config_id AND g.status = 'active'
          JOIN users u on u.cognito_id = g.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = g.cognito_id AND uu.status = 'active')
          where gc.cognito_id = $1
          AND gc.status = 'active'`, cognito_ids[i]);
        groups.push(...found_groups);
      }
    } else {
      groups = await database.query(`SELECT DISTINCT on (g.config_id)
        g.*,
        u.first_name,
        u.last_name,
        (SELECT
          COUNT(*)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = g.id
          AND bcc.owner_id = g.cognito_id
          AND bcc.status = 'active'
        ) as count,
        (SELECT
          COALESCE(SUM(up.monthly), 0)::int
          from benefits_client_config bcc
          JOIN accounts a on a.account_id = bcc.account_id AND a.status = 'active'
          JOIN subscriptions s ON s.subscription_id = a.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id ANDup.monthly > 0 AND up.status = 'active'
          where bcc.group_id = g.id AND bcc.owner_id = g.cognito_id AND bcc.status = 'active'
        ) as revenue
        from group_connections gc
        JOIN groups g on g.config_id = gc.config_id
        JOIN users u on u.cognito_id = g.cognito_id
        where gc.cognito_id = $1
        AND gc.status = 'active'`, account_id);
    }
    if (groups.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched groups.",
          "payload": uniqBy(groups, "config_id")
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find groups."
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
