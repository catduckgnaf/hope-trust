const permissions = {
  "/partners/create/{account_id}/{cognito_id}": {
    description: "Create a new partner for a specific account",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/partners/create-partner-response/{account_id}/{cognito_id}": {
    description: "Create a partner quiz response",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/partners/update-partner-response/{response_id}/{account_id}/{cognito_id}": {
    description: "Update a partner quiz response",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/partners/get-partner-responses/{account_id}/{cognito_id}": {
    description: "Get quiz responses for a specific partner account",
    authorized: [
      "account-admin-view"
    ]
  },
  "/partners/get-partner-response/{quiz_id}/{account_id}/{cognito_id}": {
    description: "Get quiz response for a specific partner account",
    authorized: [
      "account-admin-view"
    ]
  },
  "/partners/update-single-partner/{account_id}/{cognito_id}": {
    description: "Update a partner record",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/partners/create-partner-referral/{account_id}/{cognito_id}": {
    description: "Create a referral code for a partner, attach it to their root membership",
    authorized: [
      "account-admin-view"
    ]
  },
  "/partners/get-organization-partners/{account_id}/{cognito_id}": {
    description: "Get all partner records for an organization",
    authorized: [
      "account-admin-view"
    ]
  },
  "/partners/send-entity-invitation/{account_id}/{cognito_id}": {
    description: "Send invitation to partner to signup",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/partners/organization-digest/{account_id}/{cognito_id}": {
    description: "Generate an organization digest of current org partners and their clients",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/partners/add-account-to-subscription/{account_id}/{cognito_id}": {
    description: "Transfer a subscription to another customer",
    authorized: [
      "account-admin-edit"
    ]
  }
};

module.exports = permissions;
