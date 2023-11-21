const permissions = {
  "/events/get-events/{account_id}/{cognito_id}": {
    description: "Get all events for a specific account",
    authorized: [
      "health-and-life-view"
    ]
  },
  "/events/create-single-event/{account_id}/{cognito_id}": {
    description: "Create a new event for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/events/update-single-event/{event_id}/{account_id}/{cognito_id}": {
    description: "Update an event for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/events/delete-single-event/{event_id}/{account_id}/{cognito_id}": {
    description: "Delete an event for a specific account",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/events/create-bulk-events/{account_id}/{cognito_id}": {
    description: "Create many events",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/events/update-bulk-events/{series_id}/{account_id}/{cognito_id}": {
    description: "Update many events in a series",
    authorized: [
      "health-and-life-edit"
    ]
  },
  "/events/delete-bulk-events/{series_id}/{account_id}/{cognito_id}": {
    description: "Update many events in a series",
    authorized: [
      "health-and-life-edit"
    ]
  }
};

module.exports = permissions;
