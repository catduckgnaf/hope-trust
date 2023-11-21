const permissions = {
  "/referrals/create-referral/{account_id}/{cognito_id}": {
    description: "Create a new referral",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/referrals/update-referral/{referral_id}/{account_id}/{cognito_id}": {
    description: "Update a referral by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/referrals/delete-referral/{referral_id}/{account_id}/{cognito_id}": {
    description: "Delete a referral by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/referrals/delete-referrals/{account_id}/{cognito_id}": {
    description: "Delete many referrals by ID",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/referrals/get-referrals/{account_id}/{cognito_id}": {
    description: "Get all active referrals",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
