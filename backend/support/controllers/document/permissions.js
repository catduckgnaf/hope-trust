const permissions = {
  "/documents/get-account-documents/{account_id}/{cognito_id}": {
    description: "Get all documents for a specific account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/documents/get-single-document/{account_id}/{cognito_id}": {
    description: "Get a single document for a specific account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/documents/create/{account_id}/{cognito_id}": {
    description: "Create a new document for a specific account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/documents/update-single-document/{account_id}/{cognito_id}": {
    description: "Update a single document from a specific account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/documents/delete-single-document/{account_id}/{cognito_id}": {
    description: "Delete a single document from a specific account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/documents/get-signed-url/{account_id}/{cognito_id}": {
    description: "Generate a signed AWS URL",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
