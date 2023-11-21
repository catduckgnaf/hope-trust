const permissions = {
  "/hello-sign/get-signature-url/{account_id}/{cognito_id}": {
    description: "Get embeddable link for Hello Sign",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/hello-sign/get-download-link/{account_id}/{cognito_id}": {
    description: "Get download link for hellosign document",
    authorized: [
      "account-admin-view",
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
