const { cognitoClient, UserPoolId, ClientUserPoolId, BenefitsUserPoolId } = require(".");

const setSingleUserMFA = async (email, type) => {
  let user_pool_id = UserPoolId;
  if (["client", "advisor"].includes(type)) user_pool_id = ClientUserPoolId;
  if (["wholesale", "retail", "agent", "group", "team", "benefits"].includes(type)) user_pool_id = BenefitsUserPoolId;
  const params = {
    UserPoolId: user_pool_id,
    Username: email,
    SMSMfaSettings: {
      Enabled: true,
      PreferredMfa: true
    }
  };
  return cognitoClient.adminSetUserMFAPreference(params).promise()
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
};

module.exports = setSingleUserMFA;