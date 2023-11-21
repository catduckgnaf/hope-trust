const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { buildHubspotContactUpdateData, removeFalsyFromObject } = require("../../../utilities/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const updateStripeCustomer = require("../../../services/stripe/update-stripe-customer");
const updateCognitoUser = require("../../../services/cognito/update-cognito-user");
const updateHubspotContact = require("../../../services/hubspot/update-hubspot-contact");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const partner = await database.query("SELECT * from partners where cognito_id = $1 AND status = $2", cognito.id, "active");
    const oldUser = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
    const oldMembership = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito.id, account_id, "active");
    if (oldUser && oldUser.length) {
      let updateRequests = [];
      let updatedStripeUser = {};
      let cognito_updates = [];
      let first_name = updates.first_name || oldUser[0].first_name;
      let last_name = updates.last_name || oldUser[0].last_name;
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
      updateRequests.push(updateCognitoUser(cognito.id, cognito_updates));
      if (Object.values(updatedStripeUser).length && oldUser[0].customer_id) updateRequests.push(updateStripeCustomer(oldUser[0].customer_id, updatedStripeUser));
      if (oldMembership && oldMembership.length) {
        let membership_updates = {};
        if (updates.user_type) membership_updates.type = updates.user_type;
        if (updates.emergency !== undefined) membership_updates.emergency = updates.emergency || false;
        if (updates.primary_contact !== undefined) membership_updates.primary_contact = updates.primary_contact || false;
        if (updates.secondary_contact !== undefined) membership_updates.secondary_contact = updates.secondary_contact || false;
        if (updates.inherit !== undefined) membership_updates.inherit = updates.inherit || false;
        if (Object.values(membership_updates).length) updateRequests.push(database.updateById("account_memberships", oldMembership[0].id, membership_updates));
      }
      return Promise.all(updateRequests).then(async () => {
        let additional_data = [];
        if (updates.user_type) additional_data.push({ property: "account_role", value: updates.user_type });
        if (oldUser[0].hubspot_contact_id) {
          await updateHubspotContact(oldUser[0].hubspot_contact_id, [
            ...buildHubspotContactUpdateData(removeFalsyFromObject(updates), partner.length, false),
            ...additional_data
          ]);
        }
        await database.updateById("users", oldUser[0].id, { status: "inactive" });
        delete updates.user_type;
        delete updates.emergency;
        delete updates.primary_contact;
        delete updates.secondary_contact;
        delete updates.inherit;
        delete oldUser[0].id;
        const created = await database.insert(
          "users",
          {
            ...oldUser[0],
            ...updates,
            "status": "active",
            "version": oldUser[0].version + 1
          }
        );
        if (created) {
          let memberships = [];
          const user = await database.query("SELECT * from users where id = $1", created);
          const cognitoUpdated = await getCognitoUser(event, account_id);
          let final_user = { ...user[0], accounts: cognitoUpdated.accounts, verifications: cognitoUpdated.verifications };
          if (oldMembership && oldMembership.length) {
            memberships = await database.query("SELECT * from account_memberships where id = $1", oldMembership[0].id);
            final_user = { ...final_user, ...memberships[0] };
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
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to update this user."
      })
    };
  }
};
