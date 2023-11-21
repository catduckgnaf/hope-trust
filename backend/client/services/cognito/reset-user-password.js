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
  return cognitoClient.adminSetUserPassword(params).promise()
    .then(() => {
      return temporary_password;
    })
    .catch(() => {
      return false;
    });
};

module.exports = resetUserPassword;