const { plaidClient } = require("./index");

const getPlaidItem = async (token) => {
    try {
        const response = await plaidClient.itemGet({ access_token: token });
        const item = response.data.item;
        const status = response.data.status;
        return { success: true, item, status };
    } catch (error) {
        return { success: false, error };
    }
};

module.exports = getPlaidItem;