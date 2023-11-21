const permissions = {
  "/providers/create/{account_id}/{cognito_id}": {
    description: "Create a new provider for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/providers/update-single-provider/{provider_id}/{account_id}/{cognito_id}": {
    description: "Update a provider for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/providers/delete-single-provider/{provider_id}/{account_id}/{cognito_id}": {
    description: "Delete a provider for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/providers/{account_id}/{cognito_id}": {
    description: "Get all active providers for a specific account",
    authorized: [
      "health-and-life-view"
    ]
  }
};

module.exports = permissions;
