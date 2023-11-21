const { getHeaders, warm } = require("../../../utilities/request");
const createHubspotContact = require("../../../services/hubspot/create-hubspot-contact");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { email, data } = JSON.parse(event.body);
  const contact = await createHubspotContact(email, data);
  if (!contact.success) {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": contact.message
      })
    };
  } else {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": contact.message,
        "payload": contact.data
      })
    };
  }
};
