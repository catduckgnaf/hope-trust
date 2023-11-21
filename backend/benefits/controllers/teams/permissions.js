const permissions = {
  "/teams/get-teams/{account_id}/{cognito_id}": {
    description: "Get all team memberships associated with a wholesaler account",
    authorized: [
      "wholesale",
      "retail",
      "agent",
      "group"
    ]
  },
  "/teams/create-single-team/{account_id}/{cognito_id}": {
    description: "Create a new team record",
    authorized: [
      "team"
    ]
  },
  "/teams/create-new-team/{account_id}/{cognito_id}": {
    description: "Create a new team record",
    authorized: [
      "agent",
      "account-admin-edit"
    ]
  },
  "/teams/update-single-team/{team_id}/{account_id}/{cognito_id}": {
    description: "Update a team record",
    authorized: [
      "team"
    ]
  }
};

module.exports = permissions;
