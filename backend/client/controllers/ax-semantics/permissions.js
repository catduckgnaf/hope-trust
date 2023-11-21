const permissions = {
  "/ax-semantics/generate-plan/{account_id}/{cognito_id}": {
    description: "Generate a full PDF plan based on an array of project IDs",
    authorized: [
      "health-and-life-view",
      "finance-view"
    ]
  }
};

module.exports = permissions;
