const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const { buildHubspotContactData, buildHubspotContactUpdateData, removeFalsyFromObject } = require("../../../../utilities/helpers");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const updateStripeCustomer = require("../../../../services/stripe/update-stripe-customer");
const getExpandedStripeCustomer = require("../../../../services/stripe/get-expanded-customer");
const updatePaymentCollection = require("../../../../services/stripe/update-payment-collection");
const updateCognitoUser = require("../../../../services/cognito/update-cognito-user");
const updateHubspotContact = require("../../../../services/hubspot/update-hubspot-contact");
const updateHubspotDeal = require("../../../../services/hubspot/update-hubspot-deal");
const createHubspotContact = require("../../../../services/hubspot/create-hubspot-contact");
const addContactToDeal = require("../../../../services/hubspot/add-contact-to-deal");
const lookupCognitoUser = require("../../../../services/cognito/lookup-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, target_id } = event.pathParameters;
  let { updates, type, balance } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", target_id, "active");
    const oldUser = await database.queryOne("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", target_id);
    if (oldUser) {
      let updateRequests = [];
      let updatedStripeUser = {};
      let cognito_updates = [];
      let first_name = updates.first_name || oldUser.first_name;
      let last_name = updates.last_name || oldUser.last_name;
      let customer_id = updates.customer_id || oldUser.customer_id;
      if (updates.customer_id && !oldUser.customer_id) {
        updatedStripeUser.email = updates.email || oldUser.email;
        updatedStripeUser.name = `${first_name} ${last_name}`;
        updatedStripeUser.phone = updates.home_phone || oldUser.home_phone;
      }
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
      if (Math.abs(balance) >= 0) updatedStripeUser.balance = balance;
      updateRequests.push(updateCognitoUser(target_id, cognito_updates, type));
      if (Object.values(updatedStripeUser).length && customer_id) updateRequests.push(updateStripeCustomer(customer_id, updatedStripeUser));
      return Promise.all(updateRequests).then(async (a) => {
        if (oldUser.hubspot_contact_id) {
          await updateHubspotContact(oldUser.hubspot_contact_id, buildHubspotContactUpdateData(removeFalsyFromObject(updates), !!partner, false));
        } else {
          const contact = await createHubspotContact((updates.email || oldUser.email), buildHubspotContactData(removeFalsyFromObject({...oldUser, ...updates}), !!partner));
          if (contact.success) updates.hubspot_contact_id = contact.data.vid;
          const memberships = await database.query("SELECT * from account_memberships where cognito_id = $1 AND status = 'active'", oldUser.cognito_id);
          if (memberships.length) {
            for (let i = 0; i < memberships.length; i++) {
              const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", memberships[i].account_id);
              if (account && account.hubspot_deal_id) await addContactToDeal(contact.data.vid, account.hubspot_deal_id);
            }
          }
        }
        await database.updateById("users", oldUser.id, { status: "inactive" });
        delete oldUser.id;
        const created = await database.insert(
          "users",
          {
            ...oldUser,
            ...updates,
            "status": updates.status,
            "version": oldUser.version + 1
          }
        );
        if (created) {
          const user = await database.queryOne("SELECT *, concat(first_name, ' ', last_name) as name from users where id = $1", created.id);
          if (updates.status && (updates.status !== oldUser.status) && user.customer_id) {
            const customer = await getExpandedStripeCustomer(user.customer_id);
            if (customer.success && customer.customer.subscriptions.data.length) await updatePaymentCollection(customer.customer.subscriptions.data[0].id, updates.status === "active");
          }
          const primary_membership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", user.cognito_id, user.cognito_id);
          if (primary_membership && (primary_membership.type === "beneficiary" || primary_membership.type === "advisor")) {
            const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", user.cognito_id);
            if (account && updatedStripeUser.name) {
              if (account.hubspot_deal_id) await updateHubspotDeal(account.hubspot_deal_id, [{ "value": updatedStripeUser.name, "name": "dealname" }]);
              await database.updateById("accounts", account.id, { account_name: updatedStripeUser.name });
            }
          }
          type = ((type || primary_membership) && ["wholesale", "retail", "agent", "group", "team", "benefits", "advisor", "customer-support"].includes(type || primary_membership.type)) ? (type || primary_membership.type) : "client";
          const cognito_record = await lookupCognitoUser(user.email, type);
          let customer = { success: false };
          if (user.customer_id) customer = await getExpandedStripeCustomer(user.customer_id);
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created new user record",
              "payload": { ...user, type: cognito_record.success ? cognito_record.user.type : type, cognito_record: cognito_record.success ? cognito_record.user : {}, customer: customer.success ? customer.customer : false }
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
