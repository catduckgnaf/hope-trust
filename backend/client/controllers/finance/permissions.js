const permissions = {
  "/finance/get-grantor-assets/{account_id}/{cognito_id}": {
    description: "Get grantor assets for a specific account",
    authorized: [
      "grantor-assets-view",
      "grantor-assets-edit"
    ]
  },
  "/finance/get-beneficiary-assets/{account_id}/{cognito_id}": {
    description: "Get beneficiary assets for a specific account",
    authorized: [
      "finance-view",
      "finance-edit"
    ]
  },
  "/finance/get-budgets/{account_id}/{cognito_id}": {
    description: "Get budgets for a specific account",
    authorized: [
      "budget-view",
      "budget-edit"
    ]
  },
  "/finance/get-benefits/{account_id}/{cognito_id}": {
    description: "Get benefits for a specific account",
    authorized: [
      "finance-view",
      "finance-edit"
    ]
  },
  "/finance/get-income/{account_id}/{cognito_id}": {
    description: "Get income for a specific account",
    authorized: [
      "finance-view",
      "finance-edit"
    ]
  },
  "/finance/create-single-grantor-asset/{account_id}/{cognito_id}": {
    description: "Create new grantor asset for a specific user of a specific account",
    authorized: [
      "grantor-assets-edit"
    ]
  },
  "/finance/create-single-beneficiary-asset/{account_id}/{cognito_id}": {
    description: "Create new beneificary asset for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/create-single-budget/{account_id}/{cognito_id}": {
    description: "Create new budget record for a specific user of a specific account",
    authorized: [
      "budget-edit"
    ]
  },
  "/finance/create-single-benefit/{account_id}/{cognito_id}": {
    description: "Create new benefit record for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/create-single-income/{account_id}/{cognito_id}": {
    description: "Create new income record for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/update-single-income/{id}/{account_id}/{cognito_id}": {
    description: "Update income record for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/update-single-grantor-asset/{id}/{account_id}/{cognito_id}": {
    description: "Update grantor asset for a specific user of a specific account",
    authorized: [
      "grantor-assets-edit"
    ]
  },
  "/finance/update-single-beneficiary-asset/{id}/{account_id}/{cognito_id}": {
    description: "Update beneificary asset for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/update-single-budget/{id}/{account_id}/{cognito_id}": {
    description: "Update budget record for a specific user of a specific account",
    authorized: [
      "budget-edit"
    ]
  },
  "/finance/update-single-benefit/{id}/{account_id}/{cognito_id}": {
    description: "Update benefit record for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/delete-single-income/{id}/{account_id}/{cognito_id}": {
    description: "Delete income record for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/delete-single-grantor-asset/{id}/{account_id}/{cognito_id}": {
    description: "Delete grantor asset for a specific user of a specific account",
    authorized: [
      "grantor-assets-edit"
    ]
  },
  "/finance/delete-single-beneficiary-asset/{id}/{account_id}/{cognito_id}": {
    description: "Delete beneificary asset for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/delete-single-budget/{id}/{account_id}/{cognito_id}": {
    description: "Delete budget record for a specific user of a specific account",
    authorized: [
      "budget-edit"
    ]
  },
  "/finance/delete-single-benefit/{id}/{account_id}/{cognito_id}": {
    description: "Delete benefit record for a specific user of a specific account",
    authorized: [
      "finance-edit"
    ]
  },
  "/finance/get-myto-simulations/{account_id}/{cognito_id}": {
    description: "Get MYTO simulations",
    authorized: [
      "myto-view"
    ]
  },
  "/finance/create-myto-simulation/{account_id}/{cognito_id}": {
    description: "Create new MYTO simulation",
    authorized: [
      "myto-edit"
    ]
  },
  "/finance/update-single-myto-simulation/{id}/{account_id}/{cognito_id}": {
    description: "Update single MYTO simulation",
    authorized: [
      "myto-edit"
    ]
  },
  "/finance/delete-single-myto-simulation/{id}/{account_id}/{cognito_id}": {
    description: "Delete single MYTO simulation",
    authorized: [
      "myto-edit"
    ]
  },
  "/finance/calculate-myto/{account_id}/{cognito_id}": {
    description: "Run a MYTO calculation",
    authorized: [
      "myto-edit"
    ]
  }
};
module.exports = permissions;
