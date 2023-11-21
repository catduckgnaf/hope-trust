const { cognitoClient, UserPoolId, ClientUserPoolId, BenefitsUserPoolId } = require(".");

const updateCognitoUser = async (cognitoId, updates, type = "") => {
  let user_pool_id = UserPoolId;
  if (["client", "advisor"].includes(type)) user_pool_id = ClientUserPoolId;
  if (["wholesale", "retail", "agent", "group", "team", "benefits"].includes(type)) user_pool_id = BenefitsUserPoolId;
  const updateParameters = { UserPoolId: user_pool_id, Username: cognitoId, UserAttributes: updates };
  const success = await cognitoClient.adminUpdateUserAttributes(updateParameters).promise();
  if (success) return true;
  return false;
};

module.exports = updateCognitoUser;
