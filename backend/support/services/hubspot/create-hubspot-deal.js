const { hubspot } = require(".");

const createHubspotDeal = async (data) => {
  return hubspot.deals.create({ ...data })
    .then((deal) => {
      return { success: true, data: deal, message: "Successfully created Hubspot deal." };
    }).catch((err) => {
      return { success: false, message: err.error.message };
    });
};

module.exports = createHubspotDeal;