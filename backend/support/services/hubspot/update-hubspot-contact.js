const { hubspot } = require(".");

const updateHubspotContact = async (id, data) => {
  const email = data.find((d) => d.property === "email");
  if (email && !email.value) data = data.filter((d) => d.property !== "email");
  return hubspot.contacts.update(id, { properties: data })
    .then((contact) => {
      return { success: true, data: contact, message: "Successfully updated Hubspot contact." };
    }).catch((err) => {
      if (err.error && err.error.category === "OBJECT_NOT_FOUND") return { success: false, message: err.error.message, create_new: true };
      return { success: false, message: err.error ? err.error.message : "Something went wrong.", create_new: false };
    });
};

module.exports = updateHubspotContact;