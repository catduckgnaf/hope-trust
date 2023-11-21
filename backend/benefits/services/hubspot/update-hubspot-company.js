const { hubspot } = require(".");

const updateHubspotCompany = async (id, data) => {
  return hubspot.companies.update(id, { properties: data })
    .then((company) => {
      return { success: true, data: company, message: "Successfully updated Hubspot company." };
    }).catch((err) => {
      if (err.error.category === "OBJECT_NOT_FOUND") return { success: false, message: err.error.message, create_new: true };
      return { success: false, message: err.error.message, create_new: false };
    });
};

module.exports = updateHubspotCompany;