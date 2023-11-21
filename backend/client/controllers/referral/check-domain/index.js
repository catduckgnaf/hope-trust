const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { domain } = event.queryStringParameters;
  const found = await database.queryOne("SELECT * from referral_configurations where $1 = ANY(domains)", domain);
  if (found) {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched matching referrals",
        "payload": found
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "Could not find any referrals."
    })
  };
};
