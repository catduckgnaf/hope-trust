const permissions = {
  "/wholesale/get-wholesalers/{account_id}/{cognito_id}": {
    description: "Get all wholesale memberships associated with a retailer account",
    authorized: [
      "retail",
      "agent"
    ]
  },
  "/wholesale/create-single-wholesaler/{account_id}/{cognito_id}": {
    description: "Create a new wholesale record",
    authorized: [
      "wholesale"
    ]
  },
  "/wholesale/update-single-wholesaler/{wholesaler_id}/{account_id}/{cognito_id}": {
    description: "Update a wholesale record",
    authorized: [
      "wholesale"
    ]
  },
  "/wholesale/approve-wholesale-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Delete a wholesale request",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/wholesale/decline-wholesale-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Decline a wholesale request",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/wholesale/get-wholesale-approvals/{wholesale_id}/{account_id}/{cognito_id}": {
    description: "Get all pending wholesale approvals",
    authorized: [
      "account-admin-view"
    ]
  }
};

module.exports = permissions;
