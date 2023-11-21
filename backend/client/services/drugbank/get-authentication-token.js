const fetch = require("node-fetch");

const getAuthToken = async () => {
    return await fetch("https://api.drugbankplus.com/v1/tokens", {
        method: "post",
        headers: {
            "Authorization": process.env.DRUGBANK_API_KEY,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        },
    })
        .then((res) => res.json())
        .then((json) => json)
        .catch((error) => error);
};

module.exports = getAuthToken;