const { cognitoClient, UserPoolId, ClientUserPoolId, BenefitsUserPoolId } = require(".");
const possible_attempts = ["support", "client", "benefits"];
let attempted = ["support"];
let found = false;

const lookupCognitoUser = async (value, type = "", retry = false) => {
  let user_pool_id = UserPoolId;
  if (["client", "advisor"].includes(type)) {
    user_pool_id = ClientUserPoolId;
    attempted.push("client");
  }
  if (["wholesale", "retail", "agent", "group", "team", "benefits"].includes(type)) {
    user_pool_id = BenefitsUserPoolId;
    attempted.push("benefits");
  }
  const request = { UserPoolId: user_pool_id, Username: value };
  return cognitoClient.adminGetUser(request).promise()
  .then((cognitoUser) => {
    if (cognitoUser) {
      found = true;
      let user = cognitoUser;
      const attributes = user.UserAttributes;
      user["id"] = user.Username;
      user["cognito_status"] = user.UserStatus;
      user["verifications"] = attributes.filter((attribute) => {
        if (attribute.Name === "email_verified" || attribute.Name === "phone_number_verified") {
          if (attribute.Value === "true") return attribute;
        }
      }).map((attribute) => attribute.Name);
      attempted = ["support"];
      found = false;
      return { success: true, user: { ...user, type } };
    }
    found = false;
    attempted = ["support"];
    return { success: false };
  })
  .catch(async (e) => {
    if (e && e.code === "UserNotFoundException") {
      let result = { success: false };
      const diff = possible_attempts.filter((x) => !attempted.includes(x));
      for (let i = 1; i < diff.length; i++) {
        if (found) continue;
        const retry = await lookupCognitoUser(value, diff[i], true);
        if (retry && retry.success) result = { success: true, user: { ...retry.user, type: diff[i], retried: true } };
      }
      attempted = ["support"];
      found = false;
      return result;
    } else {
      found = false;
      attempted = ["support"];
      return { success: false };
    }
  });
};

module.exports = lookupCognitoUser;
