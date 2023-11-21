const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { type, parent_id, config_id, group_ids = [], retailer_ids = [] } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let agents = [];
    if (type === "team") {
      agents = await database.query(`SELECT DISTINCT ON (a.config_id)
        a.*,
        u.first_name,
        u.last_name,
        concat(u.first_name, ' ', u.last_name) as agent_name,
        concat(u.first_name, ' ', u.last_name) as account_name,
        (SELECT
          COUNT(*)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as count,
        (SELECT
          COALESCE(SUM(up.monthly), 0)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as revenue
        FROM agents a
        JOIN users u on u.cognito_id = a.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = a.cognito_id)
        WHERE a.cognito_id = $1
        AND a.status = 'active'
        AND u.status = 'active'`, parent_id, group_ids);
    } else if (type === "group") {
      agents = await database.query(`SELECT DISTINCT ON (a.config_id)
        a.*,
        u.first_name,
        u.last_name,
        concat(u.first_name, ' ', u.last_name) as agent_name,
        concat(u.first_name, ' ', u.last_name) as account_name,
        (SELECT
          COUNT(*)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($3)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as count,
        (SELECT
          COALESCE(SUM(up.monthly), 0)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($3)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as revenue,
        bcc.group_id
        FROM benefits_client_config bcc
        JOIN groups g ON g.config_id = $1
        JOIN agents a ON (a.id = bcc.agent_id OR a.cognito_id = $2 OR a.cognito_id = bcc.owner_id)
        JOIN group_connections gc ON gc.config_id = g.config_id AND gc.cognito_id = a.cognito_id
        JOIN users u on u.cognito_id = a.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = a.cognito_id)
        WHERE bcc.group_id = g.id
        AND g.status = 'active'
        AND a.status = 'active'
        AND gc.status = 'active'
        AND u.status = 'active'
        AND bcc.status = 'active'`, config_id, parent_id, group_ids);
    } else if (type === "retail") {
      agents = await database.query(`SELECT DISTINCT ON (a.config_id)
        a.*,
        u.first_name,
        u.last_name,
        concat(u.first_name, ' ', u.last_name) as agent_name,
        concat(u.first_name, ' ', u.last_name) as account_name,
        (SELECT
          COUNT(*)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as count,
        (SELECT
          COALESCE(SUM(up.monthly), 0)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as revenue
        FROM agents a
        JOIN users u on u.cognito_id = a.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = a.cognito_id)
        WHERE a.parent_id = $1
        AND a.status = 'active'
        AND u.status = 'active'`, account_id, group_ids);
    } else if (type === "wholesale") {
      agents = await database.query(`SELECT DISTINCT ON (a.config_id)
        a.*,
        u.first_name,
        u.last_name,
        concat(u.first_name, ' ', u.last_name) as agent_name,
        concat(u.first_name, ' ', u.last_name) as account_name,
        (SELECT
          COUNT(*)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as count,
        (SELECT
          COALESCE(SUM(up.monthly), 0)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND (bcc.owner_id = a.cognito_id OR bcc.agent_id = a.id)
          AND bcc.status = 'active'
        ) as revenue
        FROM agents a
        JOIN retailers r on r.cognito_id = a.parent_id
        JOIN users u on u.cognito_id = a.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = a.cognito_id)
        WHERE r.id = ANY($1)
        AND a.status = 'active'
        AND r.status = 'active'
        AND u.status = 'active'`, retailer_ids, group_ids);
    }
    if (agents.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched agents.",
          "payload": agents
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find agents."
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