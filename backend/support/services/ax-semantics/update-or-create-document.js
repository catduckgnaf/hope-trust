const fetch = require("node-fetch");

const updateOrCreateDocument = async (token, collection_id, ax_semantics_uid, data) => {
    return await fetch(`https://api.ax-semantics.com/v3/collections/${collection_id}/update-or-create-by-uid/?uid=${ax_semantics_uid}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Authorization": `JWT ${token}`,
            "Content-Type": "application/json"
        },
    })
        .then((res) => res.json())
        .then((json) => json)
        .catch((error) => error);
};

module.exports = updateOrCreateDocument;