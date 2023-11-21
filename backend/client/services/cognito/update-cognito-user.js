const { cognitoClient, UserPoolId } = require(".");

const updateCognitoUser = async (cognitoId, updates) => {
  const updateParameters = { UserPoolId, Username: cognitoId, UserAttributes: updates };
  return cognitoClient.adminUpdateUserAttributes(updateParameters).promise()
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
};

module.exports = updateCognitoUser;
