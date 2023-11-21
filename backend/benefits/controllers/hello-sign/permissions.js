const permissions = {
  "/hello-sign/get-signature-url/{account_id}/{cognito_id}": {
    description: "Get embeddable link for Hello Sign",
    authorized: []
  },
  "/hello-sign/get-download-link/{account_id}/{cognito_id}": {
    description: "Get download link for hellosign document",
    authorized: []
  },
  "/hello-sign/send-entity-invitation/{account_id}/{cognito_id}": {
    description: "Send a benefits entity an invitation to sign up",
    authorized: []
  }
};

module.exports = permissions;
