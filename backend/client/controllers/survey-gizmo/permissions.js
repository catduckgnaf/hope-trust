const permissions = {
  "/survey-gizmo/get-survey-session/{account_id}/{cognito_id}": {
    description: "Get the latest survey session for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/survey-gizmo/get-survey-sessions/{account_id}/{cognito_id}": {
    description: "Get the latest survey sessions for a specific account",
    authorized: [
      "health-and-life-view",
      "finance-view"
    ]
  },
  "/survey-gizmo/clear-account-survey/{survey_id}/{account_id}/{cognito_id}": {
    description: "Clear a surveys sessions and responses for a specific survey in a speciic account",
    authorized: [
      "health-and-life-edit"
    ]
  }
};

module.exports = permissions;
