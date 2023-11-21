const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { type, group_ids, retailer_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (type === "retail") {
      const parent_items = await database.query("SELECT DISTINCT ON (wc.config_id) w.config_id from wholesale_connections wc JOIN wholesalers w on w.config_id = wc.config_id where wc.cognito_id = $1 AND wc.status = 'active' AND w.status = 'active'", account_id);
      if (parent_items.length) {
        let wholesalers = [];
        for (let o = 0; o < parent_items.length; o++) {
          const retailer = parent_items[o];
          const wholesaler = await database.query(`SELECT DISTINCT ON (w.config_id)
          w.*,
          w.id as wholesale_id,
          u.email,
          u.first_name,
          u.last_name,
          (SELECT
            COUNT(*)::int
            from benefits_client_config bcc
            JOIN groups g on g.id = bcc.group_id AND g.status = 'active'
            JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
            JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
            JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
            where g.wholesale_id = w.id AND g.config_id = ANY($2) AND bcc.status = 'active'
          ) as count,
          (SELECT
            COALESCE(SUM(up.monthly), 0)::int
            from benefits_client_config bcc
            JOIN groups g on g.id = bcc.group_id AND g.status = 'active'
            JOIN accounts ac on ac.account_id = bcc.account_id AND ac.status = 'active'
            JOIN subscriptions s ON s.subscription_id = ac.subscription_id AND s.status = 'active'
            JOIN user_plans up ON up.price_id = s.price_id AND up.monthly > 0 AND up.status = 'active'
            where g.wholesale_id = w.id AND g.config_id = ANY($2) AND bcc.status = 'active'
          ) as revenue,
          concat(u.first_name, ' ', u.last_name) as account_name
          from wholesalers w
          JOIN users u ON u.cognito_id = w.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = w.cognito_id AND uu.status = 'active')
          WHERE w.config_id = $1
          AND u.status = 'active'
          AND w.status = 'active'`, retailer.config_id, group_ids);
          if (wholesaler.length) wholesalers.push(...wholesaler);
        }
        if (wholesalers.length) {
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully fetched wholesalers.",
              "payload": wholesalers
            })
          };
        } else {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not find wholesalers."
            })
          };
        }
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not find any wholesale memberships."
          })
        };
      }
    } else if (type === "agent") {
      const wholesalers = await database.query(`SELECT DISTINCT ON (w.config_id)
          w.*,
          w.id as wholesale_id
          from wholesale_connections wc
          JOIN wholesalers w on w.config_id = wc.config_id AND w.status = 'active'
          WHERE wc.cognito_id = $1
          AND wc.status = 'active'`, retailer_id);
      if (wholesalers.length) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully fetched wholesalers.",
            "payload": wholesalers
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not find wholesalers."
          })
        };
      }
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
