const fetch = require("node-fetch");

const getDocument = async (token, document_id) => {
    return await fetch(`https://api.ax-semantics.com/v3/documents/${document_id}`, {
        method: "get",
        headers: {
            "Authorization": `JWT ${token}`,
            "Content-Type": "application/json"
        },
    })
        .then((res) => res.json())
        .then((json) => json);
};

module.exports = getDocument;