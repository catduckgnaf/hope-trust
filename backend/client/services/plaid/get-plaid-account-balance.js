const { plaidClient } = require("./index");

const getPlaidAccountBalance = async (access_token) => {
  return plaidClient.accountsBalanceGet({ access_token })
    .then((accounts_response) => {
      if (accounts_response) return accounts_response.data.accounts;
      return false;
    })
    .catch((error) => {
      return false;
    });
};

module.exports = getPlaidAccountBalance;