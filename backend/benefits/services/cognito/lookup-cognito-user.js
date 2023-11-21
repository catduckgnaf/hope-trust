const { cognitoClient, UserPoolId, ClientUserPoolId } = require(".");

const lookupCognitoUser = async (value, type) => {
  let user_pool_id = UserPoolId;
  if (["client"].includes(type)) user_pool_id = ClientUserPoolId;
  const request = { UserPoolId: user_pool_id, Username: value };
  return cognitoClient.adminGetUser(request).promise()
  .then((cognitoUser) => {
    if (cognitoUser) {
      let user = cognitoUser;
      const attributes = user.UserAttributes;
      user["id"] = user.Username;
      user["cognito_status"] = user.UserStatus;
      user["verifications"] = attributes.filter((attribute) => {
        if (attribute.Name === "email_verified" || attribute.Name === "phone_number_verified") {
          if (attribute.Value === "true") return attribute;
        }
      }).map((attribute) => attribute.Name);
      return { success: true, user };
    }
    return { success: false };
  })
  .catch(() => {
    return { success: false };
  });
};

module.exports = lookupCognitoUser;

