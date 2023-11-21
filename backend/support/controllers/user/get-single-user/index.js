const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { omit } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const cognito = await getCognitoUser(event);
  if (cognito.isRequestUser) {
    let user = await database.queryOne("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", cognito.id);
    const primary_account = cognito.accounts.find((account) => account.cognito_id === cognito.id);
    const core_account = cognito.accounts.find((account) => account.account_id === cognito.id);
    if (user) {
      user = omit(user, ["avatar"]);
      const is_customer_support = core_account && (core_account.type === "customer-support" && core_account.permissions.includes("hopetrust-super-admin"));
      if (is_customer_support) user.is_customer_support = true;
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched user",
          "payload": {
            ...user,
            accounts: cognito.accounts,
            verifications: cognito.verifications,
            primary_account: (core_account || primary_account)
          }
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch user."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to request this user."
    })
  };
};
