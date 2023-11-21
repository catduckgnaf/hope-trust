const { hubspot } = require(".");
const { v1 } = require("uuid");

const createHubspotContact = async (email, data) => {
  if (!email) email = `hopeportalusers+${v1()}@gmail.com`;
  return hubspot.contacts.createOrUpdate(email, { properties: data })
    .then((contact) => {
      return { success: true, data: contact, message: "Successfully created Hubspot contact." };
    }).catch((err) => {
      return { success: false, message: err.error.message };
    });
};

module.exports = createHubspotContact;