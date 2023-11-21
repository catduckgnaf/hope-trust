const { hubspot } = require(".");

const createHubspotCompany = async (data) => {
  return hubspot.companies.create({ properties: data })
    .then((company) => {
      return { success: true, data: company, message: "Successfully created Hubspot company." };
    }).catch((err) => {
      return { success: false, message: err.error.message };
    });
};

module.exports = createHubspotCompany;