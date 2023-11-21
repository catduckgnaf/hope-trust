require("dotenv").config();
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { getPlaidEnvironment } = require("./utilities");

const configuration = new Configuration({
  basePath: PlaidEnvironments[getPlaidEnvironment()],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);
module.exports = { plaidClient };