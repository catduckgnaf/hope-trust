const permissions = {
  "/groups/get-groups/{account_id}/{cognito_id}": {
    description: "Get all group memberships associated with a wholesaler account",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/create-single-group/{account_id}/{cognito_id}": {
    description: "Create a new group record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/update-single-group/{group_id}/{account_id}/{cognito_id}": {
    description: "Update a group record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/delete-single-group/{group_id}/{account_id}/{cognito_id}": {
    description: "Delete a group record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/approve-group-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Delete a group request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/decline-group-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Decline a group request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/create-group-request/{account_id}/{cognito_id}": {
    description: "Create a group request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/update-group-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Update a group request",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/groups/delete-group-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Delete a group request",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
