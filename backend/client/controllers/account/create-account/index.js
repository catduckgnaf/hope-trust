const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { default_user_features, default_generic_features } = require("../../../permissions/helpers");
const { uniq } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  let { account_features = default_user_features, invite_code, account_name, account_id, cognito_id, beneficiary_id, plan, user_type, subscription_id, discount_code, referral_code, hubspot_deal_id } = JSON.parse(event.body);
  const accountComplete = account_name && cognito_id && beneficiary_id;
  if (accountComplete) {
    let cognito = await getCognitoUser(event, account_id);
    if (cognito.isRequestUser) {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1", cognito_id);
      if (user) {
        const created = await database.insert(
          "accounts", {
            account_name,
            cognito_id,
            subscription_id,
            "account_id": beneficiary_id,
            "plan_id": plan ? plan.price_id : null,
            "hubspot_deal_id": hubspot_deal_id || null,
            "status": "active",
            "version": 1
          }
        );
        if (created) {
          let coupon_features = [];
          let membership_id = beneficiary_id;
          let granted_permissions = plan ? plan.permissions : ["basic-user"];
          if (referral_code && referral_code.metadata && referral_code.metadata.isReferral === "true" && referral_code.metadata.myto_access === "true" && plan.name === "Free") granted_permissions.push("myto-view", "myto-edit");
          if (discount_code && discount_code.metadata && discount_code.metadata.features) coupon_features = discount_code.metadata.features.split(",") || [];
          if (user_type === "advisor") {
            granted_permissions = ["basic-user", "account-admin-view", "account-admin-edit"];
            account_features = default_generic_features;
          }
          if (cognito_id === beneficiary_id) membership_id = cognito_id;
          if (coupon_features.length && user_type !== "advisor") coupon_features.forEach((feature) => account_features[feature] = true);
          await database.insert("account_features", { ...account_features, account_id: membership_id });
          const membership = await database.insert(
            "account_memberships", {
              cognito_id,
              "account_id": membership_id,
              "permissions": uniq(granted_permissions),
              "status": "active",
              "primary_contact": true,
              "type": user_type,
              "approved": true,
              "version": 1
            }
          );
          if (membership) {
            if (invite_code) {
              const pending_benefits_invite = await database.queryOne("SELECT * from benefits_client_config where invite_code = $1 AND status = 'pending'", invite_code);
              if (pending_benefits_invite) await database.updateById("benefits_client_config", pending_benefits_invite.id, { "status": "active", invite_status: "claimed", account_id: beneficiary_id });
            }
            return {
              statusCode: 200,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": true,
                "message": "Successfully created account and account membership",
                "payload": created
              })
            };
          }
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
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create account."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find user. A user is required to create an account."
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
