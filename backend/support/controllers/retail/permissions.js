const permissions = {
  "/retail/get-retailers/{account_id}/{cognito_id}": {
    description: "Get all retail memberships associated with a wholesaler account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/retail/create-single-retailer/{account_id}/{cognito_id}": {
    description: "Create a new retailer record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/retail/update-single-retailer/{retailer_id}/{account_id}/{cognito_id}": {
    description: "Update a retailer record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/retail/delete-single-retailer/{retailer_id}/{account_id}/{cognito_id}": {
    description: "Delete a retailer record",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
