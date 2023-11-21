const fetch = require("node-fetch");

const getCollectionDocuments = async (token, collection_id, account_id) => {
    return await fetch(`https://api.ax-semantics.com/v3/documents?collection=${collection_id}&processing_state=generated&=-modified&uid=${account_id}`, {
        method: "get",
        headers: {
            "Authorization": `JWT ${token}`,
            "Content-Type": "application/json"
        },
    })
        .then((res) => res.json())
        .then((json) => json);
};

module.exports = getCollectionDocuments;