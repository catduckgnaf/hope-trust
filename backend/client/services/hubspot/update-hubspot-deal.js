const { hubspot } = require(".");

const updateHubspotDeal = async (id, data) => {
  return hubspot.deals.updateById(id, { properties: data })
    .then((deal) => {
      return { success: true, data: deal, message: "Successfully updated Hubspot deal." };
    }).catch((err) => {
      return { success: false, message: err.error.message };
    });
};

module.exports = updateHubspotDeal;