const { cognitoClient, UserPoolId, ClientUserPoolId, BenefitsUserPoolId } = require(".");

const deleteCognitoUser = async (email, type) => {
  let user_pool_id = UserPoolId;
  if (["client", "advisor"].includes(type)) user_pool_id = ClientUserPoolId;
  if (["wholesale", "retail", "agent", "group", "team", "benefits"].includes(type)) user_pool_id = BenefitsUserPoolId;
  const deleteParameters = { UserPoolId: user_pool_id, Username: email };
  return cognitoClient.adminDeleteUser(deleteParameters).promise()
  .then(() => {
    return true;
  })
  .catch(() => {
    return false;
  });
};

module.exports = deleteCognitoUser;
