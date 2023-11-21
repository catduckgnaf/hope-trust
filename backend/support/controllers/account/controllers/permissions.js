const permissions = {
  "/{cognito_id}/create": {
    description: "Create a new account",
    authorized: [
      "basic-user"
    ]
  },
  "/create-benefits-client/{account_id}/{cognito_id}": {
    description: "Create a new benefits record for a client account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/create-client-account/{account_id}/{cognito_id}": {
    description: "Create a new client account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-cs-users/{account_id}/{cognito_id}": {
    description: "Get all customer support users",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-all-accounts/{account_id}/{cognito_id}": {
    description: "Get all possible accounts",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-all-client-configs/{account_id}/{cognito_id}": {
    description: "Get all benefits client configs",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/send-client-invitation/{account_id}/{cognito_id}": {
    description: "Send client invitation to signup",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-pending-approvals/{account_id}/{cognito_id}": {
    description: "Get all pending benefits approvals",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-group-approvals/{account_id}/{cognito_id}": {
    description: "Get all pending group approvals",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-wholesale-approvals/{account_id}/{cognito_id}": {
    description: "Get all pending wholesale approvals",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-all-users/{account_id}/{cognito_id}": {
    description: "Get all possible users",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-all-partner-accounts/{account_id}/{cognito_id}": {
    description: "Get all possible partner accounts",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/link-customer-support-account/{account_id}/{cognito_id}": {
    description: "Create new account membership for customer support user",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-all-transactions/{account_id}/{cognito_id}": {
    description: "Get all customer transactions",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-all-products/{account_id}/{cognito_id}": {
    description: "Get all customer products",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-account-features/{account_id}/{cognito_id}": {
    description: "Fetch account features for a specific account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/update-account-features/{account_id}/{cognito_id}": {
    description: "Update account features for a specific account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/update-partner-account/{account_id}/{cognito_id}": {
    description: "Update a partner account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/update-subscription-record/{subscription_lookup_id}/{account_id}/{cognito_id}": {
    description: "Update a single subscription record by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/update-core-settings/{account_id}/{cognito_id}": {
    description: "Update core settings",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/update-single-account/{account_id}/{cognito_id}": {
    description: "Update a single account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/get-user-record/{account_id}/{cognito_id}/{target_id}": {
    description: "Get a single user record by Cognito ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/update-user-record/{account_id}/{cognito_id}/{target_id}": {
    description: "Update a single user record by Cognito ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/set-user-mfa/{account_id}/{cognito_id}/{type}/{target_id}": {
    description: "Set a single users MFA preference and enable MFA",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/reset-user-mfa/{account_id}/{cognito_id}/{type}/{target_id}": {
    description: "Reset a single users MFA preference and enable MFA",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/reset-user-password/{cognito_id}/{account_id}/{type}/{target_id}": {
    description: "Reset a single users password",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
