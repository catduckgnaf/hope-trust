const { getHeaders, warm } = require("../../../utilities/request");
const createHubspotDeal = require("../../../services/hubspot/create-hubspot-deal");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { data } = JSON.parse(event.body);
  if (data) {
    const deal = await createHubspotDeal(data);
    if (deal.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": deal.message,
          "payload": deal.data
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": deal.message
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "Hubspot deal cannot be created without data."
    })
  };
};
