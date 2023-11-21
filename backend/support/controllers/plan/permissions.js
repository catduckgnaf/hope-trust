const permissions = {
  "/plans/create-user-plan/{account_id}/{cognito_id}": {
    description: "Create a user plan",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/delete-user-plan/{plan_id}/{account_id}/{cognito_id}": {
    description: "Delete a user plan by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/update-user-plan/{plan_id}/{account_id}/{cognito_id}": {
    description: "Update a user plan by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/create-partner-plan/{account_id}/{cognito_id}": {
    description: "Create a partner plan",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/delete-partner-plan/{plan_id}/{account_id}/{cognito_id}": {
    description: "Delete a partner plan by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/update-partner-plan/{plan_id}/{account_id}/{cognito_id}": {
    description: "Update a partner plan by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/get-user-plans/{account_id}/{cognito_id}": {
    description: "Get all user plans",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/get-partner-plans/{account_id}/{cognito_id}": {
    description: "Get all partner plans",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/get-active-user-plans/{account_id}/{cognito_id}": {
    description: "Get all active user plans",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/plans/get-active-partner-plans/{account_id}/{cognito_id}": {
    description: "Get all active partner plans",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
