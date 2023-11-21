const { cognitoClient, UserPoolId, ClientUserPoolId } = require(".");

const updateCognitoUser = async (cognitoId, updates, type = "") => {
  let user_pool_id = UserPoolId;
  if (["client"].includes(type)) user_pool_id = ClientUserPoolId;
  const updateParameters = { UserPoolId: user_pool_id, Username: cognitoId, UserAttributes: updates };
  const success = await cognitoClient.adminUpdateUserAttributes(updateParameters).promise();
  if (success) return true;
  return false;
};

module.exports = updateCognitoUser;
