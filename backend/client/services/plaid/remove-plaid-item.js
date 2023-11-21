const { plaidClient } = require("./index");

const removePlaidItem = async (token) => {
    try {
        await plaidClient.itemRemove({ access_token: token });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

module.exports = removePlaidItem;