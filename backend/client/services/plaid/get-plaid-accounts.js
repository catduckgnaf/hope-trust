const { plaidClient } = require("./index");

const getPlaidAccounts = async (access_token) => {
    return plaidClient.accountsGet({ access_token })
        .then((accounts_response) => {
            if (accounts_response) return accounts_response.data.accounts;
            return false;
        })
        .catch((error) => {
            return false;
    });
};

module.exports = getPlaidAccounts;