const permissions = {
  "/plaid/get-plaid-accounts/{account_id}/{cognito_id}": {
    description: "Create accounts and get an access token to authorize Plaid",
    authorized: [
      "finance-edit"
    ]
  },
  "/plaid/get-link-token/{account_id}/{cognito_id}": {
    description: "Get a link token to authorize Plaid Link",
    authorized: [
      "finance-edit"
    ]
  }
};

module.exports = permissions;
