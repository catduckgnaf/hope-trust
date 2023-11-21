const permissions = {
  "/permissions/remove/{account_id}/{cognito_id}": {
    description: "Remove an array of permissions from a specific user of a specific account.",
    authorized: [
      "basic-user"
    ]
  },
  "/permissions/add/{account_id}/{cognito_id}": {
    description: "Add an array of permissions from a specific user of a specific account.",
    authorized: [
      "basic-user"
    ]
  }
};

module.exports = permissions;
