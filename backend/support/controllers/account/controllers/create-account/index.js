const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const { default_generic_features } = require("../../../../permissions/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  let { account_features = default_generic_features, account_name, account_id, cognito_id, beneficiary_id, user_type } = JSON.parse(event.body);
  const accountComplete = account_name && cognito_id && beneficiary_id;
  if (accountComplete) {
    let cognito = await getCognitoUser(event, account_id);
    if (cognito.isRequestUser) {
      const created = await database.insert(
        "accounts", {
          account_name,
          cognito_id,
          "account_id": beneficiary_id,
          "status": "active",
          "version": 1
        }
      );
      if (created) {
        account_features = await database.insert("account_features", { ...account_features, account_id: cognito_id });
        const membership = await database.insert(
          "account_memberships", {
            cognito_id,
            "account_id": cognito_id,
            "permissions": ["basic-user", "hopetrust-super-admin"],
            "status": "active",
            "type": user_type,
            "approved": true,
            "version": 1
          }
        );
        if (membership) {
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created account and account membership",
              "payload": {
                ...created,
                ...membership,
                features: account_features
              }
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create account membership."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create account."
        })
      };
    }
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to create this account."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You must provide information to create a new account."
    })
  };
};
