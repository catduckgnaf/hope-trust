const { getHeaders, warm } = require("../../../utilities/request");
const addContactToCompany = require("../../../services/hubspot/add-contact-to-company");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { contact_id, company_id } = JSON.parse(event.body);
  const added = await addContactToCompany(contact_id, company_id);
  if (!added.success) {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": added.message
      })
    };
  } else {
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": added.message,
        "payload": added.data
      })
    };
  }
};
