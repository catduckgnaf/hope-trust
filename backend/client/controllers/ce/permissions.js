const permissions = {
  "/ce/get-ce-configs/{account_id}/{cognito_id}": {
    description: "Get all CE configurations",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/ce/get-ce-courses/{account_id}/{cognito_id}": {
    description: "Get all CE courses",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/ce/create-or-update-ce-quiz/{account_id}/{cognito_id}": {
    description: "Create or update a quiz response",
    authorized: [
      "account-admin-edit"
    ]
  }
};

module.exports = permissions;
