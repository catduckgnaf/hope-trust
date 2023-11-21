const permissions = {
  "/agents/get-agents/{account_id}/{cognito_id}": {
    description: "Get all agent memberships associated with a wholesaler account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/agents/create-single-agent/{account_id}/{cognito_id}": {
    description: "Create a new agent record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/agents/update-single-agent/{agent_id}/{account_id}/{cognito_id}": {
    description: "Update a agent record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/agents/delete-single-agent/{agent_id}/{account_id}/{cognito_id}": {
    description: "Delete a agent record",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
