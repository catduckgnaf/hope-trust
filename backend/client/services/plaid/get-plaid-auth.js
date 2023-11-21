const { plaidClient } = require("./index");

const getPlaidAuth = async (key) => {
    return plaidClient.getAuth(key)
        .then((request) => {
            if (request) return { success: true, request };
            return { success: false };
        })
        .catch((error) => {
            return { success: false, error };
    });
};

module.exports = getPlaidAuth;