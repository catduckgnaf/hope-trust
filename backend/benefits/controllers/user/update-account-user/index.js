const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { removeFalsyFromObject, buildHubspotContactUpdateData } = require("../../../utilities/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const updateCognitoUser = require("../../../services/cognito/update-cognito-user");
const updateStripeCustomer = require("../../../services/stripe/update-stripe-customer");
const createHubspotContact = require("../../../services/hubspot/create-hubspot-contact");
const updateHubspotContact = require("../../../services/hubspot/update-hubspot-contact");
const updateHubspotDeal = require("../../../services/hubspot/update-hubspot-deal");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { updates, user_type, emergency, primary_contact, secondary_contact, inherit, cognito_id, permissions } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const is_partner = await database.query("SELECT * from partners where cognito_id = $1 AND status = $2", cognito_id, "active");
    const oldUser = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", cognito_id, "active");
    if (!oldUser.length) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find user."
        })
      };
    } else {
      const isAccountUser = await database.query("SELECT * from account_memberships where account_id = $1 AND cognito_id = $2 AND status = $3", account_id, cognito_id, "active");
      if (!isAccountUser.length) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not edit user. This user is not part of your account."
          })
        };
      } else {
        if (oldUser && oldUser.length) {
          let requests =[];
          let updatedStripeUser = {};
          let first_name = updates.first_name || oldUser[0].first_name;
          let last_name = updates.last_name || oldUser[0].last_name;
          let cognito_updates = [];
          if (updates.email) {
            cognito_updates = cognito_updates.concat([{ "Name": "email", "Value": updates.email }, { "Name": "email_verified", "Value": "true" }]);
            updatedStripeUser.email = updates.email;
          }
          if (updates.first_name || updates.last_name) {
            cognito_updates.push({ "Name": "name", "Value": `${first_name} ${last_name}` });
            updatedStripeUser.name = `${first_name} ${last_name}`;
          }
          if (updates.home_phone) {
            cognito_updates = cognito_updates.concat([{ "Name": "phone_number", "Value": updates.home_phone }, { "Name": "phone_number_verified", "Value": "false" }]);
            updatedStripeUser.phone = updates.home_phone;
          }
          requests.push(updateCognitoUser(cognito_id, cognito_updates));
          requests.push(database.query("UPDATE account_memberships SET primary_contact = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", primary_contact, cognito_id, account_id, "active"));
          requests.push(database.query("UPDATE account_memberships SET secondary_contact = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", secondary_contact, cognito_id, account_id, "active"));
          requests.push(database.query("UPDATE account_memberships SET emergency = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", emergency, cognito_id, account_id, "active"));
          requests.push(database.query("UPDATE account_memberships SET inherit = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", inherit, cognito_id, account_id, "active"));
          if (Object.values(updatedStripeUser).length && oldUser[0].customer_id) requests.push(updateStripeCustomer(oldUser[0].customer_id, updatedStripeUser));
          if (user_type) requests.push(database.query("UPDATE account_memberships SET type = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", user_type, cognito_id, account_id, "active"));
          if (permissions) requests.push(database.query("UPDATE account_memberships SET permissions = $1 where cognito_id = $2 AND account_id = $3 AND status = $4", permissions, cognito_id, account_id, "active"));
          return Promise.all(requests).then(async () => {
            await database.updateById("users", oldUser[0].id, { status: "inactive" });
            delete oldUser[0].id;
            let all_updates = removeFalsyFromObject(updates);
            let additional_data = buildHubspotContactUpdateData(all_updates, false, false);
            if (user_type) additional_data.push({ property: "account_role", value: user_type });
            if (oldUser[0].hubspot_contact_id) {
              await updateHubspotContact(oldUser[0].hubspot_contact_id, additional_data);
            } else {
              const hubspotContact = await createHubspotContact((updates.email || oldUser[0].email), additional_data);
              if (hubspotContact.success) all_updates.hubspot_contact_id = hubspotContact.data.vid;
            }
            const primary_membership = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", cognito_id, cognito_id);
            if (primary_membership.length) {
              const accounts = await database.query("SELECT * from accounts where account_id = $1 AND status = 'active'", cognito_id);
              if (accounts.length && updatedStripeUser.name) {
                if (accounts[0].hubspot_deal_id) await updateHubspotDeal(accounts[0].hubspot_deal_id, [{ "value": updatedStripeUser.name, "name": "dealname" }]);
                await database.updateById("accounts", accounts[0].id, { account_name: updatedStripeUser.name });
              }
            }
            const created = await database.insert(
              "users",
              {
                ...oldUser[0],
                ...all_updates,
                "status": "active",
                "version": oldUser[0].version + 1
              }
            );
            if (created) {
              const memberships = await database.query("SELECT * from account_memberships where account_id = $1 AND cognito_id = $2 AND status = $3", account_id, cognito_id, "active");
              const user = await database.query("SELECT * from users where id = $1", created);
              return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify({
                  "success": true,
                  "message": "Successfully created new user record",
                  "payload": { ...user[0], ...memberships[0] }
                })
              };
            } else {
              return {
                statusCode: 400,
                headers: getHeaders(),
                body: JSON.stringify({
                  "success": false,
                  "message": "Could not create new user record."
                })
              };
            }
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
        } else {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": "Could not update user."
            })
          };
        }
      }
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
