const permissions = {
  "/users/{cognito_id}": {
    description: "Get a single user",
    authorized: [
      "basic-user",
    ]
  },
  "/users/update/{account_id}/{cognito_id}": {
    description: "Update a single user",
    authorized: [
      "basic-user"
    ]
  },
  "/users/{cognito_id}/create": {
    description: "Create a new user",
    authorized: [
      "basic-user",
    ]
  },
  "/users/{cognito_id}/create-account-user": {
    description: "Create a new user and associate with a previously created account",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/users/delete/{account_id}/{cognito_id}": {
    description: "Delete a single user",
    authorized: [
      "basic-user"
    ]
  },
  "/users/update-account-user/{account_id}/{cognito_id}": {
    description: "Update a single account user",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/users/delete-account-user/{account_id}/{cognito_id}": {
    description: "Delete a single account user",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/users/reset-user-mfa/{account_id}/{cognito_id}/{access_token}": {
    description: "Turn off MFA for a single user",
    authorized: [
      "basic-user"
    ]
  },
  "/users/reset-user-password/{cognito_id}/{account_id}": {
    description: "Reset a cognito users password, temporary password",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/users/settings/notifications/{account_id}/{cognito_id}": {
    description: "Fetch or create notification settings for a user from a specific account.",
    authorized: [
      "basic-user"
    ]
  },
  "/users/settings/notifications/update/{account_id}/{cognito_id}": {
    description: "Update notification settings for a user from a specific account.",
    authorized: [
      "basic-user"
    ]
  }
};

module.exports = permissions;
