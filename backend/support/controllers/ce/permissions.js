const permissions = {
  "/ce/get-ce-configs/{account_id}/{cognito_id}": {
    description: "Get all CE configurations",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/get-ce-credits/{account_id}/{cognito_id}": {
    description: "Get all CE credits",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/create-ce-config/{account_id}/{cognito_id}": {
    description: "Create a new CE configuration",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/update-ce-config/{config_id}/{account_id}/{cognito_id}": {
    description: "Update a CE configuration",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/delete-ce-config/{config_id}/{account_id}/{cognito_id}": {
    description: "Delete a CE configuration",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/delete-ce-configs/{account_id}/{cognito_id}": {
    description: "Delete many CE configurations",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/update-ce-quiz/{quiz_id}/{account_id}/{cognito_id}": {
    description: "Update a CE quiz",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/get-ce-courses/{account_id}/{cognito_id}": {
    description: "Get all CE courses",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/create-ce-course/{account_id}/{cognito_id}": {
    description: "Create a new CE course",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/update-ce-course/{course_id}/{account_id}/{cognito_id}": {
    description: "Update a CE course",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/delete-ce-course/{course_id}/{account_id}/{cognito_id}": {
    description: "Delete a CE course",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/ce/delete-ce-courses/{account_id}/{cognito_id}": {
    description: "Delete many CE courses",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;
