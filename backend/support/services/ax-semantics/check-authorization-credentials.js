const { database } = require("../../postgres");
const { isExpired } = require("../../utilities/request");
const directGenerationAuth = require("./direct-generation-authorization");

const checkAuthorizationCredentials = async (config) => {
	console.log("Checking for existing authorization credentials...");
	const existing_authorizations = await Promise.all(config.ax_authorization_db_checks);
	let mapped_authorizations = [];
	for (let i = 0; i < existing_authorizations.length; i++) {
		const possible_authorization = existing_authorizations[i];
		const project_id = config.project_ids[i];
		if (possible_authorization.length) {
			const auth_item = possible_authorization[0];
			if (auth_item && !isExpired(auth_item.created_at, auth_item.expires_in)) {
				console.log(`Authorization not expired for project ${project_id}, moving on...`);
				mapped_authorizations.push({ base_url: auth_item.base_url, token: auth_item.jwt, api_key: auth_item.api_key, expires_in: auth_item.expires_in, project_id });
			} else {
				console.log(`Authorization expired or could not be found for project ${project_id}, generating new credentials...`);
				if (auth_item && auth_item.id) await database.delete("DELETE from ax_authorization_credentials where account_id = $1 AND survey_id = $2", config.account_id, config.survey_id);
				const authorization = await directGenerationAuth(project_id);
				await database.insert(
					"ax_authorization_credentials", {
						account_id: config.account_id,
						survey_id: config.survey_id,
						project_id,
						api_key: authorization.api_key,
						base_url: authorization.base_url,
						jwt: authorization.token,
						expires_in: authorization.expires_in,
						status: "active"
					}
				);
				mapped_authorizations.push({ ...authorization, project_id });
			}
		}
		console.log(`Authorization does not exist for project ${project_id}, generating new credentials...`);
		const authorization = await directGenerationAuth(project_id);
		await database.insert(
			"ax_authorization_credentials", {
				account_id: config.account_id,
				survey_id: config.survey_id,
				project_id,
				api_key: authorization.api_key,
				base_url: authorization.base_url,
				jwt: authorization.token,
				expires_in: authorization.expires_in,
				status: "active"
			}
		);
		mapped_authorizations.push({ ...authorization, project_id });
	}
	return mapped_authorizations;
};

module.exports = checkAuthorizationCredentials;