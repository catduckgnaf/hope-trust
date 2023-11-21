const permissions = {
  "/agents/get-agents/{account_id}/{cognito_id}": {
    description: "Get all agent memberships associated with a wholesaler account",
    authorized: [
      "wholesale",
      "retail",
      "group",
      "team"
    ]
  },
  "/agents/create-single-agent/{account_id}/{cognito_id}": {
    description: "Create a new agent record",
    authorized: [
      "agent"
    ]
  },
  "/agents/update-single-agent/{agent_id}/{account_id}/{cognito_id}": {
    description: "Update a agent record",
    authorized: [
      "agent"
    ]
  }
};

module.exports = permissions;
