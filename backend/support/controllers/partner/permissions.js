const permissions = {
  "/partners/organization-digest/{account_id}/{cognito_id}": {
    description: "Generate an organization digest of current org partners and their clients",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/partners/create-partner-referral/{account_id}/{cognito_id}": {
    description: "Generate a referral code for a specific partner account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/partners/add-account-to-subscription/{account_id}/{cognito_id}": {
    description: "Transfer a subscription to another customer",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
