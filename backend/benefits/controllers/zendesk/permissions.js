const permissions = {
  "/zendesk/create-request-ticket/{account_id}/{cognito_id}": {
    description: "Create a new zendesk request ticket for a specific user in a specific account",
    authorized: [
      "basic-user"
    ]
  },
  "/zendesk/update-request-ticket/{account_id}/{cognito_id}/{ticket_id}": {
    description: "Update zendesk request ticket for a specific user in a specific account",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/zendesk/delete-request-ticket/{account_id}/{cognito_id}/{ticket_id}": {
    description: "Delete zendesk request ticket for a specific user in a specific account",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/zendesk/get-account-requests/{account_id}/{cognito_id}": {
    description: "Get zendesk request tickets for a specific account",
    authorized: [
      "account-admin-view"
    ]
  },
  "/zendesk/get-account-request/{account_id}/{cognito_id}/{ticket_id}": {
    description: "Get single zendesk request ticket for a specific account",
    authorized: [
      "account-admin-view"
    ]
  }
};

module.exports = permissions;
