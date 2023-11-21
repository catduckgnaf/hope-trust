const { getHeaders, warm } = require("../../../utilities/request");
const updateHubspotDeal = require("../../../services/hubspot/update-hubspot-deal");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { hubspot_deal_id } = event.pathParameters;
  const { data } = JSON.parse(event.body);
  if (hubspot_deal_id) {
    const deal = await updateHubspotDeal(hubspot_deal_id, data);
    if (!deal.success) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": deal.message
        })
      };
    } else {
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
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You must include a Hubspot deal ID."
      })
    };
  }
};
