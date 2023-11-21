const permissions = {
  "/plans/get-active-user-plans/{account_id}/{cognito_id}": {
    description: "Get all active user plans",
    authorized: [
      "account-admin-view"
    ]
  }
};

module.exports = permissions;
