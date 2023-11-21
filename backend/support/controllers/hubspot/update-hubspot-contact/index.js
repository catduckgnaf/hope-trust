const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { buildHubspotContactUpdateData } = require("../../../utilities/helpers");
const updateHubspotContact = require("../../../services/hubspot/update-hubspot-contact");
const createHubspotContact = require("../../../services/hubspot/create-hubspot-contact");
const { uniqBy } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { hubspot_contact_id } = event.pathParameters;
  const { data } = JSON.parse(event.body);
  if (hubspot_contact_id) {
    const contact = await updateHubspotContact(hubspot_contact_id, data);
    if (contact.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": contact.message,
          "payload": contact.data,
          "created": false
        })
      };
    }
    if (contact.create_new) {
      const user = await database.queryOne("SELECT * from users where hubspot_contact_id = $1 AND status = 'active'", hubspot_contact_id);
      const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = 'active'", user.cognito_id);
      const create_data = buildHubspotContactUpdateData(user, partner);
      const created = await createHubspotContact(user.email, uniqBy([...data, ...create_data]));
      if (created.success) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": created.message,
            "payload": created.data,
            "created": true
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": created.message,
          "created": false
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": contact.message,
        "created": false
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You must include a Hubspot contact ID."
    })
  };
};
