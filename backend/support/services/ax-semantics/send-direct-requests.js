const directGenerationDocument = require("./direct-generation-document");

const sendDirectRequests = async (config) => {
    console.log("Passing data to Direct API...");
    let ax_direct_requests = [];
    for (let i = 0; i < config.required_authorizations.length; i++) ax_direct_requests.push(directGenerationDocument(config.required_authorizations[i], config.survey_data, config.account_id, { ...config.currentAccount, users: config.accountUsers }, config.custom_id));
    const ax_requests = await Promise.all(ax_direct_requests);
    const finished_requests = ax_requests.map((p) => p.text ? p.text : "");
    const errors = ax_requests.map((e, index) => e.message ? `${e.message} - Project ID: ${config.required_authorizations[index].project_id}` : "");
    const authorizations = ax_requests.map((a, index) => a.Authorization ? `${a.Authorization} - Project ID: ${config.required_authorizations[index].project_id}` : "");
    const log = finished_requests.map((e) => !!e);
    console.log("-----REQUEST RESULTS-----", { log, errors: [...errors, ...authorizations].filter((e) => e) });
    return { log, finished_requests, success: log.every((l) => l), errors: errors.filter((e) => e), authorizations: authorizations.filter((e) => e) };
};

module.exports = sendDirectRequests;