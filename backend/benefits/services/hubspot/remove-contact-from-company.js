const { hubspot } = require(".");

const removeContactFromCompany = async (contact_id, company_id) => {
  return hubspot.crm.associations.delete({
    "fromObjectId": company_id,
    "toObjectId": contact_id,
    "category": "HUBSPOT_DEFINED",
    "definitionId": 2
  })
  .then((association) => {
    return { success: true, data: association, message: "Successfully deleted Hubspot association." };
  }).catch((err) => {
    return { success: false, message: err.error.message };
  });
};

module.exports = removeContactFromCompany;