const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const { default_user_features } = require("../../../../permissions/helpers");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const { capitalize } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  let { account_features = default_user_features, account_name, target_account_id, cognito_id, plan_id, subscription_id, hubspot_deal_id, permissions, sendEmail, noEmail, createdUser } = JSON.parse(event.body);
  const accountComplete = account_name && cognito_id && target_account_id && plan_id && subscription_id && permissions.length;
  if (accountComplete) {
    let membership;
    let cognito = await getCognitoUser(event, account_id);
    if (cognito.isAuthorized) {
      const created = await database.insert(
        "accounts", {
          account_name,
          cognito_id,
          "account_id": target_account_id,
          plan_id,
          subscription_id,
          hubspot_deal_id,
          "status": "active",
          "version": 1
        }
      );
      if (created) {
        await database.insert("account_features", { ...account_features, account_id: target_account_id });
        membership = await database.insert(
          "account_memberships", {
            cognito_id,
            account_id: target_account_id,
            permissions,
            "status": "active",
            "type": "beneficiary",
            "approved": true,
            "version": 1
          }
        );
        if (!membership) {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not create account membership."
            })
          };
        }
        if (!created) {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not find account."
            })
          };
        }
        if (sendEmail && !noEmail) {
          await sendTemplateEmail(createdUser.email, {
            first_name: capitalize(createdUser.first_name),
            last_name: capitalize(createdUser.last_name),
            template_type: "cs_client_welcome",
            merge_fields: {
              first_name: capitalize(createdUser.first_name),
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
              subject: "Welcome to Hope Trust!",
              preheader: "Your Hope Trust account was successfully created",
              password: createdUser.temp
            }
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created account.",
            "payload": created
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create account."
        })
      };
    }
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to create this account."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You must provide information to create a new account."
    })
  };
};
