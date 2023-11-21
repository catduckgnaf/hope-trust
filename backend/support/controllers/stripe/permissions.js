const permissions = {
  "/stripe/create-stripe-product/{account_id}/{cognito_id}": {
    description: "Create a Stripe product, price and reference record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/update-stripe-product/{product_id}/{account_id}/{cognito_id}": {
    description: "Update a product record and update a stripe price",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/delete-stripe-product/{product_id}/{price_id}/{account_id}/{cognito_id}": {
    description: "Delete a product record and deactivate a stripe price",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/create-subscription/{account_id}/{cognito_id}": {
    description: "Create a Stripe subscription",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/update-subscription-plan/{account_id}/{cognito_id}": {
    description: "Update current accounts stripe subscription",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/add-payment-source/{account_id}/{cognito_id}": {
    description: "Add and optionally set new default payment source",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/create-stripe-customer/{account_id}/{cognito_id}": {
    description: "Create a Stripe customer record",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/delete-payment-source/{customer_id}/{account_id}/{cognito_id}": {
    description: "Delete a payment method from a customer",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/update-stripe-customer/{customer_id}/{account_id}/{cognito_id}": {
    description: "Update a stripe customer",
    authorized: [
      "hopetrust-super-admin"
    ]
  },
  "/stripe/create-single-charge/{account_id}/{cognito_id}": {
    description: "Create a single Stripe charge for a customer",
    authorized: [
      "hopetrust-super-admin"
    ]
  }
};

module.exports = permissions;