const permissions = {
    "/stripe/create-subscription/{account_id}/{cognito_id}": {
        description: "Create a Stripe subscription",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/update-subscription-plan/{account_id}/{cognito_id}": {
        description: "Update current accounts stripe subscription",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/add-payment-source/{account_id}/{cognito_id}": {
        description: "Add and optionally set new default payment source",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/get-stripe-customer/{customer_id}/{account_id}/{cognito_id}": {
        description: "Get a customer record by ID",
        authorized: [
            "account-admin-view"
        ]
    },
    "/stripe/create-stripe-customer/{account_id}/{cognito_id}": {
        description: "Create a Stripe customer record",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/delete-payment-source/{customer_id}/{account_id}/{cognito_id}": {
        description: "Delete a payment method from a customer",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/update-stripe-customer/{customer_id}/{account_id}/{cognito_id}": {
        description: "Update a stripe customer",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/create-partner-subscription/{account_id}/{cognito_id}": {
        description: "Create a subscription for a partner",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/create-single-charge/{account_id}/{cognito_id}": {
        description: "Create a single Stripe charge for a customer",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/create-multi-invoice/{account_id}/{cognito_id}": {
        description: "Create and charge an invoice with multiple line items",
        authorized: [
            "account-admin-edit"
        ]
    },
    "/stripe/get-products/{account_id}/{cognito_id}": {
        description: "Get a subset of products based on query string filters",
        authorized: [
            "basic-user"
        ]
    }
};

module.exports = permissions;
