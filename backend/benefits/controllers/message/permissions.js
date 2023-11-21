const permissions = {
  "/messages/send-message/{account_id}/{cognito_id}": {
    description: "Send a message",
    authorized: [
      "basic-user"
    ]
  },
  "/messages/get-messages/{account_id}/{cognito_id}": {
    description: "Get messages sent by an account",
    authorized: [
      "basic-user"
    ]
  },
  "/messages/update-message/{message_id}/{account_id}/{cognito_id}": {
    description: "Update a message",
    authorized: [
      "basic-user"
    ]
  }
};

module.exports = permissions;
