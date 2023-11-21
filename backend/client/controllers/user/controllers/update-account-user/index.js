const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { removeFalsyFromObject, buildHubspotContactUpdateData, getAccountUser } = require("../../../../utilities/helpers");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const updateCognitoUser = require("../../../../services/cognito/update-cognito-user");
const updateStripeCustomer = require("../../../../services/stripe/update-stripe-customer");
const createHubspotContact = require("../../../../services/hubspot/create-hubspot-contact");
const updateHubspotContact = require("../../../../services/hubspot/update-hubspot-contact");
const updateHubspotDeal = require("../../../../services/hubspot/update-hubspot-deal");
const { isBoolean } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { updates, type, emergency, primary_contact, secondary_contact, inherit, cognito_id, permissions } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const is_partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", cognito_id, "active");
    const oldUser = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito_id, "active");
    if (oldUser) {
      const isAccountUser = await database.queryOne("SELECT * from account_memberships where account_id = $1 AND cognito_id = $2 AND status = $3", account_id, cognito_id, "active");
      if (isAccountUser) {
        if (oldUser) {
          let requests = [];
          let updatedStripeUser = {};
          let first_name = updates.first_name || oldUser.first_name;
          let last_name = updates.last_name || oldUser.last_name;
          let cognito_updates = [];
          if (updates.email) {
            cognito_updates = cognito_updates.concat([{ "Name": "email", "Value": updates.email }, { "Name": "email_verified", "Value": "true" }]);
            updatedStripeUser.email = updates.email;
          }
          if (updates.first_name || updates.last_name) {
            cognito_updates.push({ "Name": "name", "Value": `${first_name} ${last_name}` });
            updatedStripeUser.name = `${first_name} ${last_name}`;
          }
          if (updates.hasOwnProperty("home_phone")) {
            cognito_updates = cognito_updates.concat([{ "Name": "phone_number", "Value": updates.home_phone }, { "Name": "phone_number_verified", "Value": "false" }]);
            updatedStripeUser.phone = updates.home_phone;
          }
          requests.push(updateCognitoUser(cognito_id, cognito_updates));
          if (isBoolean(primary_contact)) requests.push(database.update("account_memberships", { primary_contact }, { cognito_id, account_id, status: "active" }));
          if (isBoolean(secondary_contact)) requests.push(database.update("account_memberships", { secondary_contact }, { cognito_id, account_id, status: "active" }));
          if (isBoolean(emergency)) requests.push(database.update("account_memberships", { emergency }, { cognito_id, account_id, status: "active" }));
          if (isBoolean(inherit)) requests.push(database.update("account_memberships", { inherit }, { cognito_id, account_id, status: "active" }));
          if (Object.values(updatedStripeUser).length && oldUser.customer_id) requests.push(updateStripeCustomer(oldUser.customer_id, updatedStripeUser));
          if (type) requests.push(database.update("account_memberships", { type }, { cognito_id, account_id, status: "active" }));
          if (permissions) requests.push(database.update("account_memberships", { permissions }, { cognito_id, account_id, status: "active" }));
          return Promise.all(requests).then(async () => {
            await database.updateById("users", oldUser.id, { status: "inactive" });
            delete oldUser.id;
            let all_updates = removeFalsyFromObject(updates);
            let additional_data = buildHubspotContactUpdateData(all_updates, is_partner, false);
            if (type) additional_data.push({ property: "account_role", value: type });
            if (oldUser.hubspot_contact_id) {
              await updateHubspotContact(oldUser.hubspot_contact_id, additional_data);
            } else {
              const hubspotContact = await createHubspotContact((updates.email || oldUser.email), additional_data);
              if (hubspotContact.success) all_updates.hubspot_contact_id = hubspotContact.data.vid;
            }
            const primary_membership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", cognito_id, cognito_id);
            if (primary_membership && (primary_membership.type === "beneficiary")) {
              const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", cognito_id);
              if (account && updatedStripeUser.name) {
                if (account.hubspot_deal_id) await updateHubspotDeal(account.hubspot_deal_id, [{ "value": updatedStripeUser.name, "name": "dealname" }]);
                await database.updateById("accounts", account.id, { account_name: updatedStripeUser.name });
              }
            }
            const created = await database.insert(
              "users", {
                ...oldUser,
                ...all_updates,
                "status": "active",
                "version": oldUser.version + 1
              }
            );
            if (created) {
              const user = await getAccountUser(created.cognito_id, account_id);
              return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify({
                  "success": true,
                  "message": "Successfully created new user record",
                  "payload": user
                })
              };
            }
            return {
              statusCode: 400,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": false,
                "message": "Could not create new user record."
              })
            };
          }).catch((error) => {
            if (error.message) {
              return {
                statusCode: 400,
                headers: getHeaders(),
                body: JSON.stringify({
                  "success": false,
                  "message": error.message
                })
              };
            }
            return {
              statusCode: 400,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": false,
                "message": "Something went wrong."
              })
            };
          });
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not update user."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not edit user. This user is not part of your account."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find user."
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
