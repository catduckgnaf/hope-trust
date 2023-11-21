const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { default_generic_features } = require("../../../permissions/helpers");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const _ = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  let { status = "active", is_approved_domain = false, account_features = default_generic_features, account_name, account_id, cognito_id, beneficiary_id, plan, user_type, subscription_id, addition = false, parent_id } = JSON.parse(event.body);
  const accountComplete = account_name && cognito_id && beneficiary_id;
  if (accountComplete) {
    let cognito = await getCognitoUser(event, account_id);
    if (cognito.isRequestUser) {
      if (!addition) {
        let membership;
        const created = await database.insert(
          "accounts", {
            account_name,
            cognito_id,
            subscription_id,
            "account_id": beneficiary_id,
            "plan_id": plan ? plan.price_id : null,
            "status": "active",
            "version": 1
          }
        );
        if (created) {
          const account = await database.query("SELECT * from accounts where id = $1", created);
          if (!account.length) {
            return {
              statusCode: 400,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": false,
                "message": "Could not find account."
              })
            };
          }
          const user = await database.query("SELECT * from users where cognito_id = $1", cognito_id);
          if (!user.length) {
            return {
              statusCode: 400,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": false,
                "message": "Could not find user."
              })
            };
          }
          await database.insert("account_features", { ...account_features, account_id: cognito_id });
          membership = await database.insert(
            "account_memberships", {
              cognito_id,
              "account_id": cognito_id,
              "permissions": ["basic-user", user_type, "account-admin-view", "account-admin-edit"],
              status,
              "primary_contact": true,
              "type": user_type,
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
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created account and account membership",
              "payload": account[0]
            })
          };
        } else {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not create account."
            })
          };
        }
      } else {
        const membership = await database.insert(
          "account_memberships", {
            cognito_id,
            "account_id": parent_id ,
            "permissions": ["basic-user", user_type],
            "status": "active",
            "primary_contact": false,
            "type": user_type,
            "approved": is_approved_domain,
            "version": 1
          }
        );
        if (membership) {
          const approver = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", parent_id);
          const requester = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", cognito_id);
          await sendTemplateEmail(approver[0].email, {
            first_name: approver[0].first_name,
            last_name: approver[0].last_name,
            template_type: "account_approval_request",
            merge_fields: {
              first_name: approver[0].first_name,
              requester_name: requester.length ? `${requester[0].first_name} ${requester[0].last_name}` : null,
              type: user_type,
              login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
              subject: "Approval Required",
              preheader: `${requester.length ? `${requester[0].first_name} ${requester[0].last_name}` : "A new user"} has requested to join your account on the Hope Trust Benefits Network.`
            }
          });
          const account = await database.query("SELECT * from accounts where account_id = $1 AND status = 'active'", parent_id);
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created account membership",
              "payload": account[0]
            })
          };
        } else {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not create account membership."
            })
          };
        }
      }
    } else {
      return {
        statusCode: 401,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "You are not authorized to create this account."
        })
      };
    }
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You must provide information to create a new account."
      })
    };
  }
};
