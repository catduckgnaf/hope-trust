const permissions = {
  "/retail/get-retailers/{account_id}/{cognito_id}": {
    description: "Get all retail memberships associated with a wholesaler account",
    authorized: [
      "wholesale",
      "agent",
      "group"
    ]
  },
  "/retail/create-single-retailer/{account_id}/{cognito_id}": {
    description: "Create a new retailer record",
    authorized: [
      "retail"
    ]
  },
  "/retail/update-single-retailer/{retailer_id}/{account_id}/{cognito_id}": {
    description: "Update a retailer record",
    authorized: [
      "retail"
    ]
  }
};

module.exports = permissions;
