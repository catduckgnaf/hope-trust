const { plaidClient } = require("./index");

const getPlaidAccessToken = async (token) => {
    return plaidClient.itemPublicTokenExchange({ public_token: token })
        .then((request) => {
            if (request.data) return request.data;
            return false;
        })
        .catch((error) => {
            return false;
    });
};

module.exports = getPlaidAccessToken;