const { hubspot } = require(".");

const addContactToDeal = async (contact_id, deal_id) => {
  return hubspot.crm.associations.create({
    "fromObjectId": contact_id,
    "toObjectId": deal_id,
    "category": "HUBSPOT_DEFINED",
    "definitionId": 4
  })
  .then((association) => {
    return { success: true, data: association, message: "Successfully updated Hubspot association." };
  }).catch((err) => {
    return { success: false, message: err.error.message };
  });
};

module.exports = addContactToDeal;