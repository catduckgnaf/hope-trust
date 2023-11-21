const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { param, value, domain } = event.queryStringParameters;
  let has_domain = false;
  let referrals = [];
  if (domain) has_domain = await database.query("SELECT * from referral_configurations where $1 = ANY(domains)", domain);
  if (param && value) {
    referrals = await database.query(`SELECT * from referral_configurations where ${param} = $1 AND status = $2`, value, "active");
  } else {
    referrals = await database.query("SELECT * from referral_configurations where status = 'active'");
  }
  if (referrals.length) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched referrals",
        "payload": referrals,
        has_domain
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "Could not fetch any referrals."
    })
  };
};
