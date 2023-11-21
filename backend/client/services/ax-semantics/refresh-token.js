const fetch = require("node-fetch");

const refreshAxToken = async () => {
    return await fetch("https://idm.ax-semantics.com/v1/token-exchange/", {
        method: "post",
        body: JSON.stringify({ "refresh_token": process.env.AX_REFRESH_TOKEN }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((json) => json);
};

module.exports = refreshAxToken;