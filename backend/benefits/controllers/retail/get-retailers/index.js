const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { uniqBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { type, config_id, parent_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let retailers = [];
    if (type === "wholesale") {
      retailers = await database.query(`SELECT DISTINCT on (r.config_id, wc.config_id)
        r.*,
        concat(u.first_name, ' ', u.last_name) as account_name,
        u.first_name,
        u.last_name,
        (SELECT COUNT(*)::int from agents a where a.parent_id = r.cognito_id AND a.status = 'active') as agents
        from wholesale_connections wc
        JOIN retailers r on r.cognito_id = wc.cognito_id
        JOIN users u on u.cognito_id = r.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = r.cognito_id AND uu.status = 'active')
        where wc.config_id = $1
        AND wc.status = 'active'
        AND r.status = 'active'
        AND u.status = 'active'`, config_id);
    } else if (type === "agent") {
      retailers = await database.query(`SELECT DISTINCT on (r.config_id, wc.config_id)
        r.*,
        w.id as wholesale_id,
        u.first_name,
        u.last_name
        from wholesale_connections wc
        JOIN wholesalers w on w.config_id = wc.config_id AND w.status = 'active'
        JOIN retailers r on r.cognito_id = $1
        JOIN users u on u.cognito_id = r.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = r.cognito_id AND uu.status = 'active')
        where wc.config_id = w.config_id
        AND wc.status = 'active'
        AND r.status = 'active'
        AND u.status = 'active'`, parent_id);
    }
    if (retailers.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched retailers.",
          "payload": uniqBy(retailers, "config_id")
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find retailers."
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