const { cognitoClient, UserPoolId, ClientUserPoolId, BenefitsUserPoolId } = require(".");
const generator = require("generate-password");

const resetUserPassword = async (email, type) => {
  let user_pool_id = UserPoolId;
  if (["client", "advisor"].includes(type)) user_pool_id = ClientUserPoolId;
  if (["wholesale", "retail", "agent", "group", "team", "benefits"].includes(type)) user_pool_id = BenefitsUserPoolId;
  const temporary_password = generator.generate({ length: 16, numbers: true, symbols: false, strict: true, uppercase: true, lowercase: true });
  var params = {
    Password: temporary_password,
    UserPoolId: user_pool_id,
    Username: email,
    Permanent: false
  };
  return cognitoClient.adminSetUserPassword(params).promise()
    .then(() => {
      return temporary_password;
    })
    .catch((error) => {
      return false;
    });
};

module.exports = resetUserPassword;