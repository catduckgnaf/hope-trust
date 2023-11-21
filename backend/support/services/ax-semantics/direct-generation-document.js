const fetch = require("node-fetch");

const directGenerationDocument = async (authorization, data, account_id, account, custom_id) => {
  return fetch(`${authorization.base_url}en-US/`, {
    method: "post",
    body: JSON.stringify({
      ...data,
      name: custom_id,
      account_id,
      account,
      environment: process.env.STAGE
    }),
    headers: {
      "Authorization": `JWT ${authorization.token}`,
      "x-api-key": authorization.api_key,
      "Content-Type": "application/json"
    }
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((error) => {
      console.log("-----DIRECT GENERATION ERROR-----", error);
      return error;
    });
};

module.exports = directGenerationDocument;