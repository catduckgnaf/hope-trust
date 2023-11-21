const permissions = {
  "/hello-sign/get-download-link/{account_id}/{cognito_id}": {
    description: "Get download link for hellosign document",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
