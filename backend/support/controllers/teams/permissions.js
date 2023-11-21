const permissions = {
  "/teams/get-teams/{account_id}/{cognito_id}": {
    description: "Get all team memberships associated with a wholesaler account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/teams/create-single-team/{account_id}/{cognito_id}": {
    description: "Create a new team record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/teams/update-single-team/{team_id}/{account_id}/{cognito_id}": {
    description: "Update a team record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/teams/delete-single-team/{team_id}/{account_id}/{cognito_id}": {
    description: "Delete a team record",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
