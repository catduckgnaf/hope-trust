const permissions = {
  "/clients/get-clients/{account_id}/{cognito_id}": {
    description: "Get all client memberships associated with a wholesaler account",
    authorized: [
      "account-admin-view"
    ]
  },
  "/clients/update-user-record/{account_id}/{cognito_id}/{target_id}": {
    description: "Update client user record",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/clients/create-new-user/{account_id}/{cognito_id}": {
    description: "Create client user record",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/clients/create-client-account/{account_id}/{cognito_id}": {
    description: "Create client account record",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/clients/create-benefits-client/{account_id}/{cognito_id}": {
    description: "Create benefits reference record for client account",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/clients/send-client-invitation/{account_id}/{cognito_id}": {
    description: "Send a client invitation",
    authorized: [
      "account-admin-edit"
    ]
  }
};

module.exports = permissions;
