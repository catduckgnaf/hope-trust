const permissions = {
  "/accounts/{cognito_id}/create": {
    description: "Create a new account",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/associate/{account_id}/{cognito_id}": {
    description: "Associate a new user to an account by referral code",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/link-user-account/{account_id}/{cognito_id}": {
    description: "Associate a new user to an account by email",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/get-account-users/{account_id}/{cognito_id}": {
    description: "Get all active users associated with an account",
    authorized: [
      "account-admin-view"
    ]
  },
  "/accounts/update-single-account/{account_id}/{cognito_id}": {
    description: "Update an account",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/accounts/get-accounts/{account_id}/{cognito_id}": {
    description: "Get all associated accounts",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/get-customer-subscriptions/{customer_id}/{account_id}/{cognito_id}": {
    description: "Get subscriptions owned by this customer",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/accounts/get-customer-transactions/{customer_id}/{account_id}/{cognito_id}": {
    description: "Get transactions owned by this customer",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/accounts/get-account-features/{account_id}/{cognito_id}": {
    description: "Fetch account features for a specific account",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/cancel-subscription/{account_id}/{cognito_id}": {
    description: "Cancel a subscription",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/accounts/cancel-account-subscription/{account_id}/{cognito_id}": {
    description: "Cancel an account subscription",
    authorized: [
      "account-admin-edit"
    ]
  }
};

module.exports = permissions;
