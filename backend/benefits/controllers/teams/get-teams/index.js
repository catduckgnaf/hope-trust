const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { uniq } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { type, config_id, group_ids = [], parent_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let teams = [];
    if (type === "group") {
      teams = await database.query(`SELECT DISTINCT ON (t.config_id)
        t.*,
        (SELECT
          COUNT(*)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND bcc.owner_id = t.cognito_id AND bcc.agent_id IS NULL
          AND bcc.status = 'active'
        ) as count,
        (SELECT
          COALESCE(SUM(up.monthly), 0)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.status = 'active'
          where bcc.group_id = ANY($2)
          AND bcc.owner_id = t.cognito_id AND bcc.agent_id IS NULL
          AND bcc.status = 'active'
        ) as revenue,
        g.name as group_name,
        bcc.group_id
        FROM benefits_client_config bcc
        JOIN groups g ON g.config_id = $1
        JOIN teams t ON t.cognito_id = bcc.owner_id
        JOIN users u on u.cognito_id = t.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = t.cognito_id)
        WHERE bcc.group_id = g.id
        AND g.status = 'active'
        AND t.status = 'active'
        AND u.status = 'active'
        AND bcc.status = 'active'`, config_id, group_ids);
    } else if (["wholesale", "retail", "agent"].includes(type)) {
      teams = await database.query(`SELECT DISTINCT ON (t.config_id)
        t.*,
        (SELECT
          COUNT(*)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($1)
          AND bcc.owner_id = t.cognito_id AND bcc.agent_id IS NULL
          AND bcc.status = 'active'
        ) as count,
        (SELECT
          COALESCE(SUM(up.monthly), 0)::int
          from benefits_client_config bcc
          JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
          JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
          JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
          where bcc.group_id = ANY($1)
          AND bcc.owner_id = t.cognito_id AND bcc.agent_id IS NULL
          AND bcc.status = 'active'
        ) as revenue,
        g.name as group_name,
        bcc.group_id
        FROM benefits_client_config bcc
        JOIN groups g ON g.id = bcc.group_id
        JOIN agents a ON (a.cognito_id = $2 OR a.cognito_id = $3 OR a.parent_id = $3 OR a.cognito_id = g.parent_id OR a.id = bcc.agent_id)
        JOIN teams t ON t.cognito_id = bcc.owner_id
        JOIN users u on u.cognito_id = t.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = t.cognito_id)
        WHERE bcc.group_id = ANY($1)
        AND g.status = 'active'
        AND t.status = 'active'
        AND u.status = 'active'
        AND a.status = 'active'
        AND bcc.status = 'active'`, group_ids, parent_id, account_id);
    }
    if (teams.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched teams.",
          "payload": teams
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find teams."
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