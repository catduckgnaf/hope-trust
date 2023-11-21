const { database } = require("../../postgres");
const refreshToken = require("./refresh-token");
const addDocument = require("./add-document");

const processCollections = async (config) => {
    let ax_authorization_db_checks = [];
    let ax_collection_requests = [];
    const collection_token = await refreshToken();
    for (let i = 0; i < config.project_ids.length; i++) {
        const project_id = config.project_ids[i];
        const collection_id = config.collection_ids[i];
        if (process.env.STAGE !== "production") ax_collection_requests.push(addDocument(collection_token.id_token, collection_id, config.survey_data, config.account_id, { ...config.currentAccount, users: config.accountUsers }, config.custom_id));
        ax_authorization_db_checks.push(database.queryOne("SELECT * from ax_authorization_credentials where account_id = $1 AND survey_id = $2 AND project_id = $3 AND status = 'active'", config.account_id, config.survey_id, project_id));
    }
    console.log("Passing data to collections...");
    Promise.all(ax_collection_requests)
        .then((results) => {
            if (results.details) console.log(results.details);
            if (results.length && Array.isArray(results[0].blob)) console.log("ERROR:", results[0].blob[0]);
            if (results.length) console.log(`${ax_collection_requests.length} Collection posts sent`, results.map((c) => c.processing_state));
        }).catch((error) => console.log("-----COLLECTION ERROR-----", error));
    return { ax_authorization_db_checks };
};

module.exports = processCollections;