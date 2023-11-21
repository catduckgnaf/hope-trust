const fetch = require("node-fetch");

const addDocument = async (token, collection_id, data, account_id, account, custom_id) => {
  return await fetch(`https://api.ax-semantics.com/v3/collections/${collection_id}/document/`, {
    method: "post",
    body: JSON.stringify({ ...data, name: custom_id, account_id, account, environment: process.env.STAGE }),
    headers: {
      "Authorization": `JWT ${token}`,
      "Content-Type": "application/json"
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((error) => error);
};

module.exports = addDocument;