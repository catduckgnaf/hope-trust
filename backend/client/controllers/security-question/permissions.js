const permissions = {
  "/security-questions/{account_id}/{cognito_id}": {
    description: "Get all possible security questions",
    authorized: [
      "basic-user"
    ]
  },
  "/security-questions/user/{account_id}/{cognito_id}": {
    description: "Get all security question responses for a specific user of a specific account",
    authorized: [
      "basic-user"
    ]
  },
  "/security-questions/response/create/{account_id}/{cognito_id}": {
    description: "Create a security question response for a specific user of a specific account",
    authorized: [
      "basic-user"
    ]
  }
};

module.exports = permissions;