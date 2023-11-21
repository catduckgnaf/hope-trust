const permissions = {
  "/tickets/get-tickets/{account_id}/{cognito_id}": {
    description: "Get all tickets.",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/tickets/get-ticket/{ticket_id}/{account_id}/{cognito_id}": {
    description: "Get a single ticket.",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/tickets/create-ticket/{account_id}/{cognito_id}": {
    description: "Create a new ticket record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/tickets/update-ticket/{ticket_id}/{account_id}/{cognito_id}": {
    description: "Update a ticket record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/tickets/delete-ticket/{ticket_id}/{account_id}/{cognito_id}": {
    description: "Delete a ticket record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/tickets/delete-tickets/{account_id}/{cognito_id}": {
    description: "Delete multiple ticket records",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
