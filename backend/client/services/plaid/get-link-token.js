const { plaidClient } = require("./index");

const getPlaidLinkToken = async (user, webhook, access_token) => {
  let products = [];
  if (!access_token) products = ["auth", "transactions", "identity"];
  return plaidClient.linkTokenCreate({
    user: {
      client_user_id: user.cognito_id,
      email_address: user.email,
      email_address_verified_time: user.created_at
    },
    access_token,
    webhook,
    client_name: "Hope Trust",
    products,
    country_codes: ["US"],
    language: "en"
  })
    .then((request) => {
      if (request.data) return request.data.link_token;
      return false;
    })
    .catch((error) => {
      return false;
    });
};

module.exports = getPlaidLinkToken;