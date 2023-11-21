const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { default_user_features } = require("../../../permissions/helpers");
const { buildHubspotContactUpdateData, getAccountUser } = require("../../../utilities/helpers");
const createHubspotContact = require("../../../services/hubspot/create-hubspot-contact");
const addContactToDeal = require("../../../services/hubspot/add-contact-to-deal");
const { capitalize } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { referral_code, approved = false, discountCode, requester } = JSON.parse(event.body);
  let cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", account_id);
    const plan = await database.queryOne("SELECT * from user_plans where price_id = $1 AND status = 'active'", account.plan_id);
    const inviter = await database.queryOne("SELECT * from account_memberships where referral_code = $1 AND status = 'active'", referral_code); // the core account membership of the referral code holder
    if (inviter) {
      const foundUser = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", inviter.cognito_id); // the user associated with the referral code
      if (foundUser) {
        const existingLink = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", foundUser.cognito_id, account_id); // any existing links to this account
        if (!existingLink) {
          let coupon_features = [];
          let granted_permissions = plan ? plan.permissions : ["basic-user"];
          if (discountCode && discountCode.metadata && discountCode.metadata.isReferral === "true" && discountCode.metadata.myto_access === "true" && plan.name === "Free") granted_permissions.push("myto-view", "myto-edit");
          if (discountCode && discountCode.metadata && discountCode.metadata.features) coupon_features = discountCode.metadata.features.split(",") || [];
          const membership = await database.insert(
            "account_memberships", {
              account_id,
              approved,
              "cognito_id": foundUser.cognito_id,
              "permissions": granted_permissions,
              "status": "active",
              "linked_account": true,
              "version": 1
            }
          );
          if (!membership) {
            return {
              statusCode: 400,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": false,
                "message": "Could not associate user to account."
              })
            };
          }
          const features = await database.queryOne("SELECT * from account_features where account_id = $1", account_id);
          const partner_data = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", foundUser.cognito_id, "active");
          const referral_config = await database.queryOne("SELECT * from referral_configurations where name = $1", partner_data.name);
          const current_features = Object.keys(features).filter((item) => !["id", "account_id", "created_at", "updated_at"].includes(item));
          const referral_features = referral_config ? referral_config.features : [];
          const array_diff = current_features.filter((x) => !referral_features.includes(x));
          let feature_updates = {};
          if (referral_features.length) referral_features.forEach((feature) => feature_updates[feature] = true);
          if (array_diff.length) {
            array_diff.forEach((feature) => {
              if (features[feature] && !default_user_features[feature]) feature_updates[feature] = true;
              else feature_updates[feature] = false;
            });
          }
          if (coupon_features.length) coupon_features.forEach((feature) => feature_updates[feature] = true);
          await database.updateById("account_features", features.id, { ...feature_updates });

          const hubspotContact = await createHubspotContact(foundUser.email, buildHubspotContactUpdateData(foundUser, false, "account link"));
          if (hubspotContact.success && account.hubspot_deal_id) {
            await database.updateById("users", foundUser.id, { hubspot_contact_id: hubspotContact.data.vid });
            await addContactToDeal(hubspotContact.data.vid, account.hubspot_deal_id);
          }

          if (requester && !approved) {
            await sendTemplateEmail(foundUser.email, {
              first_name: capitalize(foundUser.first_name),
              last_name: capitalize(foundUser.last_name),
              template_type: "account_link_request",
              merge_fields: {
                first_name: capitalize(foundUser.first_name),
                login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
                requester_name: `${capitalize(requester.first_name)} ${capitalize(requester.last_name)}`,
                requester_first_name: capitalize(requester.first_name),
                subject: "Account Link Request",
                preheader: `${capitalize(requester.first_name)} ${capitalize(requester.last_name)} wants to add you to their Hope Trust account.`
              }
            });
          }
          const user = await getAccountUser(foundUser.cognito_id, account_id);
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully associated user with account",
              "payload": { user, inviter }
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": `This account is already linked to ${foundUser.first_name} ${foundUser.last_name}.`
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not verify invitation for this account."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not verify referral code."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};
