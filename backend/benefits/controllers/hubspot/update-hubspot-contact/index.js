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
    if (!contact.success) {
      if (!contact.create_new) {
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
      const users = await database.query("SELECT * from users where hubspot_contact_id = $1 AND status = 'active'", hubspot_contact_id);
      const partners = await database.query("SELECT * from partners where cognito_id = $1 AND status = 'active'", users[0].cognito_id);
      const create_data = buildHubspotContactUpdateData(users[0], partners[0]);
      const created = await createHubspotContact(users[0].email, uniqBy([ ...data, ...create_data ]));
      if (!created.success) {
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
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": created.message,
          "payload": created.data,
          "created": true
        })
      };
    } else {
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
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You must include a Hubspot contact ID."
      })
    };
  }
};
