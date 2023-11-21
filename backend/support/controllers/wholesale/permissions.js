const permissions = {
  "/wholesale/get-wholesalers/{account_id}/{cognito_id}": {
    description: "Get all wholesale memberships associated with a retailer account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/create-single-wholesaler/{account_id}/{cognito_id}": {
    description: "Create a new wholesale record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/update-single-wholesaler/{wholesaler_id}/{account_id}/{cognito_id}": {
    description: "Update a wholesale record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/delete-single-wholesaler/{wholesaler_id}/{account_id}/{cognito_id}": {
    description: "Delete a wholesaler record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/approve-wholesale-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Delete a wholesale request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/decline-wholesale-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Decline a wholesale request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/create-wholesale-request/{account_id}/{cognito_id}": {
    description: "Create a wholesale request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/update-wholesale-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Update a wholesale request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/wholesale/delete-wholesale-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Delete a wholesale request",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
