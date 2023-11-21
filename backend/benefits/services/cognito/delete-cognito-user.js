const { cognitoClient, UserPoolId, ClientUserPoolId } = require(".");

const deleteCognitoUser = async (email, type) => {
  let user_pool_id = UserPoolId;
  if (["client"].includes(type)) user_pool_id = ClientUserPoolId;
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