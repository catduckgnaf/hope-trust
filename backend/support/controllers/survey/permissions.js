const permissions = {
  "/survey/get-surveys/{account_id}/{cognito_id}": {
    description: "Get all surveys",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/get-sessions/{account_id}/{cognito_id}": {
    description: "Get all survey sessions",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/create-survey/{account_id}/{cognito_id}": {
    description: "Create a new survey record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/update-survey/{survey_id}/{account_id}/{cognito_id}": {
    description: "Update a survey record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/delete-survey/{survey_id}/{account_id}/{cognito_id}": {
    description: "Delete a survey record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/update-session/{session_id}/{account_id}/{cognito_id}": {
    description: "Update a session record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/delete-session/{session_id}/{account_id}/{cognito_id}": {
    description: "Delete a session record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/delete-sessions/{account_id}/{cognito_id}": {
    description: "Delete multiple session records",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/survey/delete-surveys/{account_id}/{cognito_id}": {
    description: "Delete multiple survey records",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
