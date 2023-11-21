const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { capitalize } = require("../../../utilities/helpers");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { getSessionDataAPI } = require("../../../services/survey-gizmo/get-session-data");
const sendDirectRequests = require("../../../services/ax-semantics/send-direct-requests");
const processCollections = require("../../../services/ax-semantics/process-collections");
const checkAuthorizationCredentials = require("../../../services/ax-semantics/check-authorization-credentials");
const { orderBy, pick, omit } = require("lodash");
const { mergeAccount } = require("../../../services/cognito/utilities");
const moment = require("moment");
const { v1 } = require("uuid");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  let all_processed = [];
  const processing_responses = await database.query("SELECT * from survey_responses where processing = true AND status = 'active'");
  if (processing_responses.length) {
    console.log(`${processing_responses.length} total responses waiting to be processed.`);
    let mapped_account_responses = {};
    for (let i = 0; i < processing_responses.length; i++) {
      const response = processing_responses[i];
      if (mapped_account_responses[response.account_id]) mapped_account_responses[response.account_id].push(response);
      else mapped_account_responses[response.account_id] = [response];
    }
    for (let i = 0; i < Object.keys(mapped_account_responses).length; i++) {
      let sent_emails = [];
      const account_key = Object.keys(mapped_account_responses)[i];
      const account_responses = orderBy(mapped_account_responses[account_key], ["created_at", "updated_at"], ["desc", "desc"]);
      console.log(`${account_responses.length} responses waiting to be processed for account ${account_key}.`);
      for (let ar = 0; ar < account_responses.length; ar++) {
        const response = account_responses[ar];
        const session_data = await getSessionDataAPI(response.survey_id, response.session_id);
        console.log(`Session ${session_data.ready ? "ready. Updating response record" : "not ready. Processing will retry"}.`);
        if (!session_data.ready) continue;
        const custom_id = v1();
        const userAccounts = await mergeAccount(response.cognito_id);
        const userAccount = userAccounts.find((account) => account.account_id === response.account_id);
        const currentAccount = omit(userAccount, ["plan_id", "approved", "account_id", "created_at", "permissions", "subscription_id", "subscription", "user_plan", "features"]);
        const accountUsers = currentAccount.users.map((user) => {
          user.birthday = user.birthday ? moment(new Date(user.birthday)).format("MMMM DD, YYYY") : null;
          return pick(user, ["customer_id", "email", "first_name", "middle_name", "last_name", "gender", "pronouns", "emergency", "primary_contact", "secondary_contact", "inherit", "home_phone", "other_phone", "type", "birthday", "partner_data", "partner_title", "address", "address2", "city", "state", "zip"]);
        });
        const collections_authorizations = await processCollections({
          project_ids: response.project_ids,
          collection_ids: response.collection_ids,
          survey_data: session_data,
          account_id: response.account_id,
          currentAccount,
          accountUsers,
          custom_id,
          survey_id: response.survey_id
        });
        const authorization_credentials = await checkAuthorizationCredentials({
          ax_authorization_db_checks: collections_authorizations.ax_authorization_db_checks,
          project_ids: response.project_ids,
          account_id: response.account_id,
          survey_id: response.survey_id
        });
        const required_authorizations = await Promise.all(authorization_credentials);
        const direct_requests = await sendDirectRequests({
          required_authorizations,
          survey_data: session_data,
          account_id: response.account_id,
          currentAccount,
          accountUsers,
          custom_id
        });
        if (!direct_requests.success) continue;
        await database.query("UPDATE survey_responses set blob = $1, html = $2, processing = false where id = $3", JSON.stringify(session_data), ((direct_requests.finished_requests || []).join("")), response.id);
        const users = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", response.cognito_id);
        if (!sent_emails.includes(users.email)) {
          const remaining_account_responses = await database.query("SELECT sr.*, u.first_name, u.last_name, u.cognito_id from survey_responses sr JOIN users u ON u.cognito_id = sr.cognito_id AND u.status = 'active' where sr.processing = true AND sr.status = 'active' AND sr.account_id = $1", account_key);
          const remaining_filtered = remaining_account_responses.filter((u) => u.cognito_id !== response.cognito_id);
          await sendTemplateEmail(users.email, {
            first_name: capitalize(users.first_name),
            last_name: capitalize(users.last_name),
            template_type: "response_processed",
            merge_fields: {
              first_name: capitalize(users.first_name),
              has_more: remaining_filtered.length ? true : false,
              remaining_count: remaining_filtered.length,
              remaining_users: remaining_filtered.map((r) => `${r.first_name} ${r.last_name} - Submitted on ${moment(r.created_at).format("MM/DD/YYYY [at] h:mm A")}`),
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
              subject: "Your data is ready!",
              preheader: "We have finished processing your survey response."
            }
          });
          sent_emails.push(users.email);
        }
        all_processed.push(response.id);
      }
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      message: `${all_processed.length} responses processed. ${processing_responses.length - all_processed.length} responses remaining in queue.`
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    message: "No responses in processing queue. Exiting early."
  };
};

