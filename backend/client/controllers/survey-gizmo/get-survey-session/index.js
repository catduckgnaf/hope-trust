const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const sendDirectRequests = require("../../../services/ax-semantics/send-direct-requests");
const processCollections = require("../../../services/ax-semantics/process-collections");
const checkAuthorizationCredentials = require("../../../services/ax-semantics/check-authorization-credentials");
const { getAccounts, getAccountUsers } = require("../../../utilities/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { getSessionData } = require("../../../services/survey-gizmo/get-session-data");
const { pick, omit } = require("lodash");
const moment = require("moment");
const test_data = require("./test_data");
const { v1 } = require("uuid");
/*

Endpoint expects to receive the following:

@account_id - A valid HopeTrust account ID
@cognito_id - A valid Cognito ID
@survey_id - A Survey Gizmo survey ID integer
@survey_name - A Survey Gizmo survey slug, ie: GettingStarted
@project_ids - An array of AX Semantics project ID strings
@collection_ids - An array of AX Semantics collection ID integers

*/

const end = (start) => {
  let end = moment();
  let total = end.diff(start, "seconds");
  console.log(`Function ended: Took ${total} seconds`, end.format("hh:mm:ss"));
};

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  let start = moment();
  const custom_id = v1();
  console.log(`Starting function - ${start.format("hh:mm:ss")} - REQUEST ID: ${custom_id}`);
  const { account_id, cognito_id } = event.pathParameters;
  const { survey_id, survey_name, project_ids, collection_ids, is_test } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const userAccounts = await getAccounts(cognito_id, account_id);
    const userAccount = userAccounts.find((account) => account.account_id === account_id);
    const currentAccount = omit(userAccount, ["plan_id", "approved", "account_id", "created_at", "permissions", "subscription_id", "subscription", "user_plan", "partner_plan", "features"]);
    const users = await getAccountUsers(account_id);
    const accountUsers = users.map((user) => {
      user.birthday = user.birthday ? moment(new Date(user.birthday)).format("MMMM DD, YYYY") : null;
      return pick(user, ["customer_id", "email", "first_name", "middle_name", "last_name", "gender", "pronouns", "emergency", "primary_contact", "secondary_contact", "inherit", "home_phone", "other_phone", "type", "birthday", "partner_data", "partner_title", "address", "address2", "city", "state", "zip"]);
    });
    const session = await database.queryOne(`SELECT DISTINCT ON (ss.session_id)
      s.*,
      sr.processing,
      ss.cognito_id,
      ss.account_id,
      ss.session_id,
      ss.is_complete,
      ss.access_time,
      ss.updated_at,
      array_position(sys.survey_order::text[], s.survey_name::text) as sort_order
      from survey_sessions ss
      JOIN surveys s ON s.survey_id = ss.survey_id AND s.status = 'active'
      LEFT JOIN survey_responses sr ON sr.account_id = ss.account_id AND sr.survey_id = ss.survey_id AND sr.status = 'active'
      JOIN system_settings sys ON sys.id = 'system_settings'
      where ss.account_id = $1 AND ss.survey_id = $2 AND ss.status = 'active' ORDER BY ss.session_id, ss.access_time DESC`, account_id, survey_id);
    if (session) {
      console.log(is_test ? "Loading test data..." : "Normalizing Data...");
      let survey_data = test_data;
      if (!is_test) survey_data = await getSessionData(survey_id, survey_name, session.session_id);
      const normalize_success = survey_data ? survey_data.response_status === 200 : false;
      const collections_authorizations = await processCollections({
        project_ids,
        collection_ids,
        survey_data,
        account_id,
        currentAccount,
        accountUsers,
        custom_id,
        survey_id
      });
      const authorization_credentials = await checkAuthorizationCredentials({
        ax_authorization_db_checks: collections_authorizations.ax_authorization_db_checks,
        project_ids,
        account_id,
        survey_id
      });
      const required_authorizations = await Promise.all(authorization_credentials);
      const direct_requests = await sendDirectRequests({
        required_authorizations,
        survey_data,
        account_id,
        currentAccount,
        accountUsers,
        custom_id
      });
      if (direct_requests.success) {
        const oldResponse = await database.queryOne("SELECT * from survey_responses where account_id = $1 AND survey_id = $2 AND status = 'active'", account_id, survey_id);
        if (oldResponse) {
          console.log("Finishing up...");
          const oldResponseUpdated = await database.update("survey_responses", { status: "inactive" }, { account_id, survey_id });
          if (oldResponseUpdated) {
            console.log(`Updated old response record #${oldResponse.id}.`);
            delete oldResponse.id;
            const created = await database.insert(
              "survey_responses", {
                ...oldResponse,
                cognito_id,
                project_ids,
                collection_ids,
                "blob": normalize_success ? JSON.stringify(survey_data) : oldResponse.blob,
                "html": normalize_success ? direct_requests.finished_requests.join("") : oldResponse.html,
                "status": "active",
                "processing": !normalize_success,
                "version": oldResponse.version + 1
              }
            );
            if (created) {
              console.log(`Created new response record #${created.id}.`);
              console.log("Done.");
              end(start);
              return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify({
                  "success": true,
                  "message": "Successfully updated survey response",
                  "payload": {
                    ...session,
                    "processing": created.processing
                  },
                  "log": direct_requests.log,
                  "errors": direct_requests.errors,
                  "authorizations": direct_requests.authorizations
                })
              };
            }
            console.log("Done.");
            end(start);
            return {
              statusCode: 400,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": false,
                "retry": true,
                "message": "Could not create survey response."
              })
            };
          }
          console.error("Done. Failed to update response.");
          end(start);
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not find or update survey response."
            })
          };
        }
        console.log("Response does not exist, creating new response record.");
        const created = await database.insert(
          "survey_responses", {
            cognito_id,
            account_id,
            survey_id,
            project_ids,
            collection_ids,
            "blob": normalize_success ? JSON.stringify(survey_data) : "",
            "session_id": session.session_id,
            "html": normalize_success ? direct_requests.finished_requests.join("") : "",
            "status": "active",
            "processing": !normalize_success,
            "version": 1
          }
        );
        if (created) {
          console.log("Created new response record.");
          console.log("Done.");
          end(start);
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created new survey response",
              "payload": {
                ...session,
                "processing": created.processing
              },
              "log": direct_requests.log,
              "errors": direct_requests.errors,
              "authorizations": direct_requests.authorizations
            })
          };
        }
        console.log("Done.");
        end(start);
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "retry": true,
            "message": "Could not create survey response."
          })
        };
      }
      console.log("Done.");
      end(start);
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "retry": true,
          "message": "Failed to generate from all collections.",
          "log": direct_requests.log,
          "errors": direct_requests.errors,
          "authorizations": direct_requests.authorizations
        })
      };
    }
    console.log("Done.");
    end(start);
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch survey session."
      })
    };
  }
  console.log("Done.");
  end(start);
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};