const permissions = {
  "/messages/send-message/{account_id}/{cognito_id}": {
    description: "Send a message",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/messages/get-messages/{account_id}/{cognito_id}": {
    description: "Get messages sent by an account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/messages/delete-message/{message_id}/{account_id}/{cognito_id}": {
    description: "Delete a single message record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/messages/delete-messages/{account_id}/{cognito_id}": {
    description: "Delete many message records",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/messages/update-message/{message_id}/{account_id}/{cognito_id}": {
    description: "Update a single message record",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
