const { hubspot } = require(".");

const addContactToCompany = async (contact_id, company_id) => {
  return hubspot.crm.associations.create({
    "fromObjectId": contact_id,
    "toObjectId": company_id,
    "category": "HUBSPOT_DEFINED",
    "definitionId": 1
  })
  .then((association) => {
    return { success: true, data: association, message: "Successfully updated Hubspot association." };
  }).catch((err) => {
    return { success: false, message: err.error.message };
  });
};

module.exports = addContactToCompany;