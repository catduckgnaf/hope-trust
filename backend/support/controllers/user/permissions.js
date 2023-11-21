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
  "/users/create-new-user/{account_id}/{cognito_id}": {
    description: "Create a new user",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/users/delete/{account_id}/{cognito_id}": {
    description: "Delete a single user",
    authorized: [
      "basic-user"
    ]
  },
  "/users/reset-user-mfa/{account_id}/{cognito_id}/{access_token}": {
    description: "Turn off MFA for a single user",
    authorized: [
      "basic-user"
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
