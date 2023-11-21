const { cognitoClient } = require(".");

const resetUserMFA = async (accessToken) => {
  var params = {
    AccessToken: accessToken,
    SMSMfaSettings: {
      Enabled: false,
      PreferredMfa: false
    }
  };
  return await cognitoClient.setUserMFAPreference(params).promise();
};

module.exports = resetUserMFA;
