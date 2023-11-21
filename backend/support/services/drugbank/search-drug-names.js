const fetch = require("node-fetch");

const searchDrugNames = async (query) => {
    return await fetch(`https://api.drugbankplus.com/v1/us/drug_names?q=${query}`, {
        method: "get",
        headers: {
            "Authorization": process.env.DRUGBANK_API_KEY,
            "Content-Type": "application/json"
        },
    })
        .then((res) => res.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            return error;
        });
};

module.exports = searchDrugNames;