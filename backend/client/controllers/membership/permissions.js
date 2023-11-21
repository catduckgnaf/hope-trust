const permissions = {
  "/membership/update/{account_id}/{cognito_id}": {
    description: "Update a single account membership",
    authorized: [
      "basic-user"
    ]
  },
  "/membership/delete-account-membership/{membership_id}/{account_id}/{cognito_id}": {
    description: "Update a single account membership",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/membership/approve-account-membership/{account_id}/{cognito_id}": {
    description: "Approve a single account membership",
    authorized: [
      "account-admin-edit"
    ]
  }
};

module.exports = permissions;
