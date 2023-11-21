const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { buildHubspotContactUpdateData } = require("../../../utilities/helpers");
const createCognitoUser = require("../../../services/cognito/create-cognito-user");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const createHubspotContact = require("../../../services/hubspot/create-hubspot-contact");
const addContactToDeal = require("../../../services/hubspot/add-contact-to-deal");
const { v1 } = require("uuid");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { creation_type, ignore_membership = false, newAccountUser, permissions, user_type, emergency, primary_contact, inherit, account_id, sendEmail, noEmail, plan, creator } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    let membership = {};
    if (noEmail || !newAccountUser.email) newAccountUser.email = `hopeportalusers+${v1()}@gmail.com`;
    const isPreviouslyRegistered = await database.query("SELECT * from users where email = $1 AND status = 'active'", newAccountUser.email);
    if (!isPreviouslyRegistered.length) {
      const newCognitoUser = await createCognitoUser(newAccountUser, false, creation_type);
      if (newCognitoUser) {
        let username = null;
        if (newAccountUser.email && !noEmail) {
          const is_username_taken = await database.query("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", newAccountUser.email.split("@")[0]);
          if (!is_username_taken.length) username = newAccountUser.email.split("@")[0];
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
          const user = await database.query("SELECT * from users where id = $1", created);
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
          if (!ignore_membership) {
            const created_membership = await database.insert(
              "account_memberships", {
              emergency,
              primary_contact,
              inherit,
              "cognito_id": user[0].cognito_id,
              "account_id": (user_type === "beneficiary") ? user[0].cognito_id : account_id,
              "permissions": (user_type === "beneficiary") ? plan.permissions : permissions,
              "type": user_type,
              "status": "active",
              "approved": true,
              "notified": sendEmail,
              "version": 1
            }
            );
            if (created_membership) {
              const accounts = await database.query("SELECT * from accounts where account_id = $1 AND status = 'active'", account_id);
              const memberships = await database.query("SELECT * from account_memberships where id = $1", created_membership);
              if (memberships.length) membership = memberships[0];
              const hubspotContact = await createHubspotContact(user[0].email, [
                ...buildHubspotContactUpdateData(user[0], false, "relationship"),
                { property: "account_role", value: user_type },
                { "property": "hs_lead_status", "value": "CUSTOMER" }
              ]);
              if (hubspotContact.success) await database.updateById("users", created, { hubspot_contact_id: hubspotContact.data.vid });
              if (accounts[0].hubspot_deal_id) await addContactToDeal(hubspotContact.data.vid, accounts[0].hubspot_deal_id);
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
          if (sendEmail && user_type !== "beneficiary") {
            await sendTemplateEmail(newAccountUser.email, {
              first_name: capitalize(newAccountUser.first_name),
              last_name: capitalize(newAccountUser.last_name),
              template_type: "new_user",
              merge_fields: {
                first_name: capitalize(newAccountUser.first_name),
                login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
                creator_name: `${capitalize(creator.first_name)} ${capitalize(creator.last_name)}`,
                creator_first_name: capitalize(creator.first_name),
                user_type: capitalize(user_type),
                password: newCognitoUser.TemporaryPassword,
                subject: `${capitalize(creator.first_name)} added you to Hope Trust`,
                preheader: `${capitalize(creator.first_name)} ${capitalize(creator.last_name)} has added you to their Hope Trust account.`
              }
            });
          } else if (sendEmail && user_type === "beneficiary") {
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
          const updated_cognito = await getCognitoUser(event, account_id);
          const updated_user = await database.query("SELECT * from users where id = $1", created);
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created user",
              "payload": { new_user: { ...updated_user[0], ...membership }, new_accounts: updated_cognito.accounts }
            })
          };
        } else {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not create user."
            })
          };
        }
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "There was an error creating the Cognito user."
          })
        };
      }
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "This email is already registered as a HopeTrust user. Trying linking your accounts by email instead."
        })
      };
    }
  } else {
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to create this user."
      })
    };
  }
};
