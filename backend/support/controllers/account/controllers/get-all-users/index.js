const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const lookupCognitoUser = require("../../../../services/cognito/lookup-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const all_users = await database.query(`SELECT DISTINCT on (u.cognito_id)
      u.id,
      u.cognito_id,
      u.first_name,
      u.last_name,
      concat(u.first_name, ' ', u.last_name) as name,
      u.email,
      u.customer_id,
      u.home_phone,
      u.state,
      u.home_phone,
      u.status,
      u.created_at,
      (SELECT (COUNT(*)::int > 0) from partners p where p.cognito_id = u.cognito_id AND p.status = 'active') as is_partner,
      (SELECT COUNT(*)::int from account_memberships aa where aa.cognito_id = u.cognito_id AND aa.status = 'active') as count,
      (SELECT string_agg(aa.account_id, ',') from account_memberships aa where aa.cognito_id = u.cognito_id AND aa.status = 'active') as accounts,
      am.type from users u
      LEFT JOIN account_memberships am on am.cognito_id = u.cognito_id AND am.status = 'active'
      where u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id)
      AND am.type != ANY($1)
      OR u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id)
      AND am.type IS NULL
      OR u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id)`, '{"customer-support"}');
    if (all_users.length) {
      const known_users = all_users.filter((u) => u.count);
      let limbo_users = all_users.filter((u) => !u.count && u.status === "active" && !u.type);
      let requests = [];
      for (let i = 0; i < limbo_users.length; i++) requests.push(lookupCognitoUser(limbo_users[i].email));
      await Promise.all(requests).then((results) => {
        results.forEach((result, index) => {
          limbo_users[index] = {
            ...limbo_users[index],
            type: (result.success ? result.user.type : limbo_users[index].type),
            cognito_record: result.success ? result.user : {}
          };
        });
      });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched all users",
          "payload": [...known_users, ...limbo_users].map((u) => {
            return {
              ...u,
              is_account_owner: (u.accounts ? u.accounts.split(" ,").includes(u.cognito_id) : false)
            };
          })
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch all users."
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
