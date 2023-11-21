const permissions = {
  "/accounts/{cognito_id}/create": {
    description: "Create a new account",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/cancel-join-request/{cognito_id}": {
    description: "Cancel a requst to join an account.",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/get-account-users/{account_id}/{cognito_id}": {
    description: "Get all active users associated with an account",
    authorized: [
      "basic-user"
    ]
  },
  "/accounts/update-benefits-config/{config_id}/{account_id}/{cognito_id}": {
    description: "Update benefits config record",
    authorized: [
      "account-admin-edit"
    ]
  },
};

module.exports = permissions;
