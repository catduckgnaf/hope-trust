const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { convertArray } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { referral_id, account_id } = event.pathParameters;
  let { updates } = JSON.parse(event.body);
  let { domains, features } = updates;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (domains && domains.length) updates.domains = convertArray(domains);
    if (features && features.length) updates.features = convertArray(features);
    const updated = await database.updateById("referral_configurations", referral_id, { ...updates, status: updates.status || (domains && domains.length ? "active" : "inactive") }, "id");
    if (updated) {
      const record = await database.queryOne(`SELECT
        r.*,
        (SELECT COUNT(*)::int from partners p where p.name = r.name AND p.status = 'active') as count,
        (SELECT string_agg(p.cognito_id, ',') from partners p where p.name = r.name AND p.status = 'active') as partners
        from referral_configurations r where id = $1`, updated.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated referral record",
          "payload": record
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update referral record."
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
