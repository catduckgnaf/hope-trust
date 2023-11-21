const Stripe = require("../../../../services/stripe");
const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { updateAccountMembershipPlanPermissions } = require("../../../../permissions/helpers");
const getExpandedStripeCustomer = require("../../../../services/stripe/get-expanded-customer");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  if (event.headers["stripe-signature"]) {
    const { data } = JSON.parse(event.body);
    console.log(data)
    const { object } = data;
    const { status, customer, id } = object;
    console.log(status, customer, id)
    const expanded_customer = await getExpandedStripeCustomer(customer);
    console.log(expanded_customer)
    // if (!cancelled_subscription_id) { // if we didn't find a subscription ID in the webhook body
    //   return {
    //     statusCode: 400,
    //     headers: getHeaders(),
    //     body: JSON.stringify({
    //       "success": false,
    //       "message": "Could not find an active subscription for this account."
    //     })
    //   };
    // }
    // const historic_accounts = await database.query("SELECT * from accounts where subscription_id = $1 LIMIT 1", cancelled_subscription_id);
    // const oldAccountUpdated = await database.query("UPDATE accounts set status = $1 where account_id = $2", "inactive", accounts[0].account_id);
    // if (oldAccountUpdated) {
    //   delete accounts[0].id;
    //   const created = await database.insert( // create a new record with canceled parameters
    //     "accounts",
    //     {
    //       ...accounts[0],
    //       "plan_id": "free",
    //       "subscription_id": null,
    //       "status": "active",
    //       "version": accounts[0].version + 1
    //     }
    //   );
    //   if (created) {
    //     await updateAccountMembershipPlanPermissions("free", accounts[0].account_id, "cancel"); // update the account users permissions
    //   }
    // }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Acknowledged."
      })
    };
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};

