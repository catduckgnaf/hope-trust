const { cognitoClient, UserPoolId, ClientUserPoolId } = require(".");
const generator = require("generate-password");

const createCognitoUser = async (newAccountUser, sendEmail = false, type) => {
  let user_pool_id = UserPoolId;
  if (["client"].includes(type)) user_pool_id = ClientUserPoolId;
  const TemporaryPassword = generator.generate({ length: 16, numbers: true, symbols: false, strict: true, uppercase: true, lowercase: true });
  let newUserParameters = {
    UserPoolId: user_pool_id,
    Username: newAccountUser.email,
    ForceAliasCreation: true,
    TemporaryPassword,
    MessageAction: "SUPPRESS",
    UserAttributes: [
      {
        Name: "email",
        Value: newAccountUser.email
      },
      {
        Name: "name",
        Value: `${newAccountUser.first_name} ${newAccountUser.last_name}`
      }
    ]
  };
  if (newAccountUser.home_phone) newUserParameters.UserAttributes.push({ Name: "phone_number", Value: newAccountUser.home_phone });
  if (sendEmail) delete newUserParameters.MessageAction;
  return cognitoClient.adminCreateUser(newUserParameters).promise()
  .then((cognitoUser) => {
    if (cognitoUser) return { ...cognitoUser.User, TemporaryPassword };
    return false;
  })
  .catch((error) => {
    console.log(error);
    return false;
  });
};

module.exports = createCognitoUser;
