const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { buildHubspotContactUpdateData, removeFalsyFromObject } = require("../../../../utilities/helpers");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const updateStripeCustomer = require("../../../../services/stripe/update-stripe-customer");
const updateCognitoUser = require("../../../../services/cognito/update-cognito-user");
const updateHubspotContact = require("../../../../services/hubspot/update-hubspot-contact");
const { isBoolean } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", cognito.id, "active");
    const oldUser = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
    const oldMembership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito.id, account_id, "active");
    if (oldUser) {
      let updateRequests = [];
      let updatedStripeUser = {};
      let cognito_updates = [];
      let first_name = updates.first_name || oldUser.first_name;
      let last_name = updates.last_name || oldUser.last_name;
      if (updates.email) {
        cognito_updates = cognito_updates.concat([{ "Name": "email", "Value": updates.email }, { "Name": "email_verified", "Value": "false" }]);
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
      updateRequests.push(updateCognitoUser(cognito.id, cognito_updates));
      if (Object.values(updatedStripeUser).length && oldUser.customer_id) updateRequests.push(updateStripeCustomer(oldUser.customer_id, updatedStripeUser));
      if (oldMembership) {
        let membership_updates = {};
        if (updates.user_type) membership_updates.type = updates.user_type;
        if (isBoolean(updates.emergency)) membership_updates.emergency = updates.emergency;
        if (isBoolean(updates.primary_contact)) membership_updates.primary_contact = updates.primary_contact;
        if (isBoolean(updates.secondary_contact)) membership_updates.secondary_contact = updates.secondary_contact;
        if (isBoolean(updates.inherit)) membership_updates.inherit = updates.inherit;
        if (Object.values(membership_updates).length) updateRequests.push(database.updateById("account_memberships", oldMembership.id, membership_updates));
      }
      return Promise.all(updateRequests).then(async () => {
        let additional_data = [];
        if (updates.user_type) additional_data.push({ property: "account_role", value: updates.user_type });
        if (oldUser.hubspot_contact_id) {
          await updateHubspotContact(oldUser.hubspot_contact_id, [
            ...buildHubspotContactUpdateData(removeFalsyFromObject(updates), !!partner, false),
            ...additional_data
          ]);
        }
        await database.updateById("users", oldUser.id, { status: "inactive" });
        delete updates.user_type;
        delete updates.emergency;
        delete updates.primary_contact;
        delete updates.secondary_contact;
        delete updates.inherit;
        delete oldUser.id;
        const created = await database.insert(
          "users", {
            ...oldUser,
            ...updates,
            "status": "active",
            "version": oldUser.version + 1
          }
        );
        if (created) {
          const cognitoUpdated = await getCognitoUser(event, account_id);
          let final_user = { ...created, accounts: cognitoUpdated.accounts, verifications: cognitoUpdated.verifications };
          if (oldMembership) {
            const membership = await database.queryOne("SELECT * from account_memberships where id = $1", oldMembership.id);
            final_user = { ...final_user, ...membership };
          }
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created new user record",
              "payload": final_user
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
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to update this user."
    })
  };
};
