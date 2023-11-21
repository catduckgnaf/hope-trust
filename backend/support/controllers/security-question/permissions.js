const permissions = {
  "/security-questions/{account_id}/{cognito_id}": {
    description: "Get all possible security questions",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/security-questions/question/create/{account_id}/{cognito_id}": {
    description: "Create a new security question",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/security-questions/update-security-question/{question_id}/{account_id}/{cognito_id}": {
    description: "Update a security question by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/security-questions/delete-security-question/{question_id}/{account_id}/{cognito_id}": {
    description: "Delete a security question by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/security-questions/get-security-question-response/{question_id}/{user_cognito_id}/{account_id}/{cognito_id}": {
    description: "Delete a security question by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;