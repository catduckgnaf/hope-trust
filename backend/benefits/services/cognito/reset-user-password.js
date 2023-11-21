const { cognitoClient, UserPoolId } = require(".");
const generator = require("generate-password");

const resetUserPassword = async (email) => {
  const temporary_password = generator.generate({ length: 16, numbers: true, symbols: false, strict: true, uppercase: true, lowercase: true });
  var params = {
    Password: temporary_password,
    UserPoolId,
    Username: email,
    Permanent: false
  };
  const reset = await cognitoClient.adminSetUserPassword(params).promise();
  if (reset) return temporary_password;
  return false;
};

module.exports = resetUserPassword;