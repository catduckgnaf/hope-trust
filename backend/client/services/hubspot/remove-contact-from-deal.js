const { hubspot } = require(".");

const removeContactFromDeal = async (contact_id, deal_id) => {
  return hubspot.crm.associations.delete({
    "fromObjectId": deal_id,
    "toObjectId": contact_id,
    "category": "HUBSPOT_DEFINED",
    "definitionId": 3
  })
  .then((association) => {
    return { success: true, data: association, message: "Successfully deleted Hubspot association." };
  }).catch((err) => {
    return { success: false, message: err.error.message };
  });
};

module.exports = removeContactFromDeal;