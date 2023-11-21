const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const addNewPaymentSource = require("../../../services/stripe/add-payment-source");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getExpandedStripeCustomer = require("../../../services/stripe/get-expanded-customer");
const createStripeCustomer = require("../../../services/stripe/create-stripe-customer");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { source, primary } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const account = cognito.accounts.find((a) => a.account_id === account_id);
    const creator = account.users.find((user) => user.customer_id && !user.linked_account);
    let customer_id = creator ? creator.customer_id : false;
    if (!customer_id) {
      const current_user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
      const customer = await createStripeCustomer(current_user.home_phone, `${current_user.first_name} ${current_user.last_name}`, current_user.email);
      if (customer.success) {
        customer_id = customer.response.id;
        await database.updateById("users", current_user.id, { customer_id });
      }
    }
    const added = await addNewPaymentSource({ customer_id }, source, primary);
    const expanded_customer = await getExpandedStripeCustomer(customer_id);
    if (added.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": added.message,
          "payload": expanded_customer
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": added.message
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};
