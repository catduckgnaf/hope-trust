const { cognitoClient, UserPoolId } = require(".");

const lookupCognitoUser = async (email) => {
  const request = { UserPoolId, Username: email };
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
  .catch((e) => {
    return { success: false, message: e.message, error: e };
  });
};

module.exports = lookupCognitoUser;