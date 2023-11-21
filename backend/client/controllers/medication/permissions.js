const permissions = {
  "/medications/search/{account_id}/{cognito_id}": {
    description: "Search drugbank for medications",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/medications/create-single-medication/{account_id}/{cognito_id}": {
    description: "Create a new medication for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/medications/update-single-medication/{medication_id}/{account_id}/{cognito_id}": {
    description: "Update a medication for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/medications/delete-single-medication/{medication_id}/{account_id}/{cognito_id}": {
    description: "Delete a medication for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/medications/get-medications/{account_id}/{cognito_id}": {
    description: "Get all medications for an account",
    authorized: [
      "health-and-life-view"
    ]
  },
};

module.exports = permissions;
