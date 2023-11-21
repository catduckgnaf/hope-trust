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
    if (possible_authorization) {
      if (possible_authorization && !isExpired(possible_authorization.created_at, possible_authorization.expires_in)) {
        console.log(`Authorization not expired for project ${project_id}, moving on...`);
        mapped_authorizations.push({ base_url: possible_authorization.base_url, token: possible_authorization.jwt, api_key: possible_authorization.api_key, expires_in: possible_authorization.expires_in, project_id });
      } else {
        console.log(`Authorization expired or could not be found for project ${project_id}, generating new credentials...`);
        if (possible_authorization && possible_authorization.id) await database.delete("DELETE from ax_authorization_credentials where account_id = $1 AND survey_id = $2", config.account_id, config.survey_id);
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
    } else {
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
  }
  return mapped_authorizations;
};

module.exports = checkAuthorizationCredentials;