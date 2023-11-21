const permissions = {
  "/stripe/create-subscription/{account_id}/{cognito_id}": {
    description: "Create a Stripe subscription",
    authorized: [
      "account-admin-edit"
    ]
  }
};

module.exports = permissions;