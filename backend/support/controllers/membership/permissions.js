const permissions = {
  "/membership/update/{account_id}/{cognito_id}": {
    description: "Update a single account membership",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/membership/create-new-membership/{account_id}/{cognito_id}": {
    description: "Create a single account membership",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/membership/delete-account-membership/{membership_id}/{account_id}/{cognito_id}": {
    description: "Delete a single account membership",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
