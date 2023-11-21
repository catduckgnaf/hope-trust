const permissions = {
  "/groups/get-groups/{account_id}/{cognito_id}": {
    description: "Get all group memberships associated with a wholesaler account",
    authorized: [
      "wholesale",
      "retail",
      "agent",
      "team"
    ]
  },
  "/groups/create-single-group/{account_id}/{cognito_id}": {
    description: "Create a new group record",
    authorized: [
      "group",
      "agent"
    ]
  },
  "/groups/create-new-group/{account_id}/{cognito_id}": {
    description: "Create a new group record",
    authorized: [
      "agent",
      "account-admin-edit"
    ]
  },
  "/groups/update-single-group/{group_id}/{account_id}/{cognito_id}": {
    description: "Update a group record",
    authorized: [
      "group"
    ]
  },
  "/groups/approve-group-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Delete a group request",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/groups/decline-group-request/{request_id}/{account_id}/{cognito_id}": {
    description: "Decline a group request",
    authorized: [
      "account-admin-edit"
    ]
  },
  "/groups/get-group-approvals/{group_id}/{account_id}/{cognito_id}": {
    description: "Get all pending group approvals",
    authorized: [
      "account-admin-view"
    ]
  },
};

module.exports = permissions;
