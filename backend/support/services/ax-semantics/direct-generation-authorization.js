const fetch = require("node-fetch");

const directGenerationAuth = async (project_id) => {
    return await fetch("https://api.ax-semantics.com/v3/token-exchange/direct-api/", {
        method: "post",
        body: JSON.stringify({ "refresh_token": process.env.AX_REFRESH_TOKEN, project_id }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((json) => json);
};

module.exports = directGenerationAuth;