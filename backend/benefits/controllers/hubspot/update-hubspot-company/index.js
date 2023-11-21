const { getHeaders, warm } = require("../../../utilities/request");
const updateHubspotCompany = require("../../../services/hubspot/update-hubspot-company");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { hubspot_company_id } = event.pathParameters;
  const { data } = JSON.parse(event.body);
  if (hubspot_company_id) {
    const company = await updateHubspotCompany(hubspot_company_id, data);
    if (!company.success) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": company.message,
          "created": false
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": company.message,
          "payload": company.data,
          "created": false
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You must include a Hubspot company ID."
      })
    };
  }
};
