const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { buildHubspotContactUpdateData, getAccountUser } = require("../../../../utilities/helpers");
const createCognitoUser = require("../../../../services/cognito/create-cognito-user");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const createHubspotContact = require("../../../../services/hubspot/create-hubspot-contact");
const addContactToDeal = require("../../../../services/hubspot/add-contact-to-deal");
const { v1 } = require("uuid");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const { capitalize } = require("../../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { ignore_membership = false, newAccountUser, permissions, type, emergency, primary_contact, inherit, account_id, sendEmail, noEmail, plan, creator, target_hubspot_deal_id = false } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    let membership = false;
    if (!newAccountUser.email && noEmail) newAccountUser.email = `hopeportalusers+${v1()}@gmail.com`;
    const isPreviouslyRegistered = await database.queryOne("SELECT * from users where email = $1 AND status = 'active'", newAccountUser.email);
    if (!isPreviouslyRegistered) {
      const newCognitoUser = await createCognitoUser(newAccountUser);
      if (newCognitoUser) {
        let username = null;
        if (newAccountUser.email && !noEmail) {
          const is_username_taken = await database.queryOne("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", newAccountUser.email.split("@")[0]);
          if (!is_username_taken) username = newAccountUser.email.split("@")[0];
        }
        const created = await database.insert(
          "users", {
            ...newAccountUser,
            username,
            "cognito_id": newCognitoUser.Username,
            "version": 1
          }
        );
        if (created) {
          if (!ignore_membership) {
            membership = await database.insert(
              "account_memberships", {
                emergency,
                primary_contact,
                inherit,
                "cognito_id": created.cognito_id,
                "account_id": (type === "beneficiary") ? created.cognito_id : account_id,
                "permissions": (type === "beneficiary") ? plan.permissions : permissions,
                type,
                "status": "active",
                "approved": true,
                "notified": sendEmail,
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
            const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", account_id);
            const hubspotContact = await createHubspotContact(created.email, [
              ...buildHubspotContactUpdateData(created, false, "relationship"),
              { property: "account_role", value: type },
              { "property": "hs_lead_status", "value": "CUSTOMER" }
            ]);
            if (hubspotContact.success) await database.updateById("users", created.id, { hubspot_contact_id: hubspotContact.data.vid });
            if ((target_hubspot_deal_id || account.hubspot_deal_id)) await addContactToDeal(hubspotContact.data.vid, (target_hubspot_deal_id || account.hubspot_deal_id));
          }
          if (sendEmail && type !== "beneficiary") {
            await sendTemplateEmail(newAccountUser.email, {
              first_name: capitalize(newAccountUser.first_name),
              last_name: capitalize(newAccountUser.last_name),
              template_type: "new_user",
              merge_fields: {
                first_name: capitalize(newAccountUser.first_name),
                login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
                creator_name: `${capitalize(creator.first_name)} ${capitalize(creator.last_name)}`,
                creator_first_name: capitalize(creator.first_name),
                type: capitalize(type),
                password: newCognitoUser.TemporaryPassword,
                subject: `${capitalize(creator.first_name)} added you to Hope Trust`,
                preheader: `${capitalize(creator.first_name)} ${capitalize(creator.last_name)} has added you to their Hope Trust account.`
              }
            });
          } else if (sendEmail && type === "beneficiary") {
            await sendTemplateEmail(newAccountUser.email, {
              first_name: capitalize(newAccountUser.first_name),
              last_name: capitalize(newAccountUser.last_name),
              template_type: "beneficiary_welcome",
              merge_fields: {
                first_name: capitalize(newAccountUser.first_name),
                login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
                creator_name: `${capitalize(creator.first_name)} ${capitalize(creator.last_name)}`,
                creator_first_name: capitalize(creator.first_name),
                password: newCognitoUser.TemporaryPassword,
                subject: "Welcome to Hope Trust!",
                preheader: `${capitalize(creator.first_name)} ${capitalize(creator.last_name)} has added you to their Hope Trust account.`
              }
            });
          }
          const user = await getAccountUser(created.cognito_id, ((type === "beneficiary") ? created.cognito_id : account_id));
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created user",
              "payload": user || created
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create user."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "There was an error creating the Cognito user."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "This email is already registered as a HopeTrust user. Trying linking your accounts by email instead."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to create this user."
    })
  };
};
