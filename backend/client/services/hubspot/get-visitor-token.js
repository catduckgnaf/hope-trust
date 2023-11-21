const { hubspotClient } = require(".");

const getVisitorToken = async (user) => {
  return hubspotClient.conversations.visitorIdentification.generateApi.generateToken({
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name
  })
  .then((response) => {
    return { success: true, token: response.body.token, message: "Successfully generated visitor token." };
  }).catch((err) => {
    return { success: false, message: err.message };
  });
};

module.exports = getVisitorToken;