const { cognitoClient } = require(".");

const resetUserMFA = async (accessToken) => {
  var params = {
    AccessToken: accessToken,
    SMSMfaSettings: {
      Enabled: false,
      PreferredMfa: false
    }
  };
  return cognitoClient.setUserMFAPreference(params).promise()
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
};

module.exports = resetUserMFA;
