const { cognitoClient, UserPoolId } = require(".");

const deleteCognitoUser = async (email) => {
  const deleteParameters = { UserPoolId, Username: email };
  return cognitoClient.adminDeleteUser(deleteParameters).promise()
  .then(() => {
    return true;
  })
  .catch(() => {
    return false;
  });
};

module.exports = deleteCognitoUser;
