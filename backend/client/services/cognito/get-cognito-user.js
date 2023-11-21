const { cognitoClient, UserPoolId } = require(".");
const { isRequestUser, isAuthorized } = require("../../permissions/helpers");

const getCognitoUser = async (event, account_id) => {
  let providerId = event.requestContext.authorizer.jwt.claims ? event.requestContext.authorizer.jwt.claims.sub : false;
  if (providerId) {
    let claimed_pool_id = event.requestContext.authorizer.jwt.claims.iss.split("/").pop();
    const request = { UserPoolId: (claimed_pool_id || UserPoolId), Username: providerId };
    const cognitoUser = await cognitoClient.adminGetUser(request).promise();
    if (cognitoUser) {
      let user = cognitoUser;
      if (event.pathParameters) {
        const { cognito_id } = event.pathParameters;
        user["isRequestUser"] = isRequestUser(user, cognito_id);
      }
      const attributes = user.UserAttributes;
      user["id"] = user.Username;
      user["cognito_status"] = user.UserStatus;
      user["verifications"] = attributes.filter((attribute) => {
        if (attribute.Name === "email_verified" || attribute.Name === "phone_number_verified") {
          if (attribute.Value === "true") return attribute;
        }
        if (attribute.Name === "email") user["email"] = attribute.Value;
      }).map((attribute) => attribute.Name);
      if (account_id) user["isAuthorized"] = await isAuthorized(event.routeKey.split(" ")[1], account_id, user.Username);
      return user;
    }
    return false;
  }
  return false;
};

module.exports = getCognitoUser;
