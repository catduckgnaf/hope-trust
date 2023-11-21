const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { buildHubspotContactUpdateData } = require("../../../utilities/helpers");
const createCognitoUser = require("../../../services/cognito/create-cognito-user");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const createHubspotContact = require("../../../services/hubspot/create-hubspot-contact");
const addContactToDeal = require("../../../services/hubspot/add-contact-to-deal");
const createStripeCustomer = require("../../../services/stripe/create-stripe-customer");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { user, create_stripe_customer, create_hubspot_contact, associated_account, pool_type } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const isPreviouslyRegistered = await database.query("SELECT * from users where email = $1 AND status = 'active'", user.email);
    if (!isPreviouslyRegistered.length) {
      const newCognitoUser = await createCognitoUser(user, false, pool_type);
      if (newCognitoUser) {
        let username = null;
        if (user.email) {
          const is_username_taken = await database.query("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", user.email.split("@")[0]);
          if (!is_username_taken.length) username = user.email.split("@")[0];
        }
        const created = await database.insert(
          "users", {
            username,
            ...user,
            "cognito_id": newCognitoUser.Username,
            "status": "active",
            "version": 1
          }
        );
        if (created) {
          const new_user = await database.query("SELECT * from users where id = $1", created);
          if (!new_user.length) {
            return {
              statusCode: 400,
              headers: getHeaders(),
              body: JSON.stringify({
                "success": false,
                "message": "Could not find user."
              })
            };
          }
          if (associated_account) {
            await database.insert(
              "account_memberships", {
                "cognito_id": new_user[0].cognito_id,
                "account_id": associated_account.value,
                "permissions": ["basic-user"],
                "status": "active",
                "notified": false,
                "approved": true,
                "version": 1
              }
            );
          }
          let additional_updates = {};
          if (create_stripe_customer) {
            const stripe_customer = await createStripeCustomer(new_user[0].home_phone, `${new_user[0].first_name} ${new_user[0].last_name}`, new_user[0].email);
            additional_updates["customer_id"] = stripe_customer.response.id;
          }
          if (create_hubspot_contact) {
            const hubspotContact = await createHubspotContact(new_user[0].email, [
              ...buildHubspotContactUpdateData(new_user[0], false, "customer support"),
              { "property": "hs_lead_status", "value": "NEW" }
            ]);
            if (hubspotContact.success) {
              additional_updates["hubspot_contact_id"] = hubspotContact.data.vid;
              if (associated_account && associated_account.deal_id) await addContactToDeal(hubspotContact.data.vid, associated_account.deal_id);
            }
          }
          if (Object.keys(additional_updates).length) await database.updateById("users", created, additional_updates);
          const updated_user = await database.query(`SELECT DISTINCT on (am.cognito_id, am.account_id)
            u.cognito_id,
            u.first_name,
            u.last_name,
            u.email,
            u.customer_id,
            u.home_phone,
            u.state,
            u.home_phone,
            u.status,
            u.created_at,
            (SELECT COUNT(*)::int from account_memberships aa where aa.cognito_id = u.cognito_id AND aa.status = 'active') as count,
            (SELECT string_agg(aa.account_id, ', ') from account_memberships aa where aa.cognito_id = u.cognito_id AND aa.status = 'active') as accounts,
            am.type from users u
            LEFT JOIN account_memberships am on am.cognito_id = u.cognito_id AND am.status = 'active'
            where u.id = $1`, created);
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created user",
              "payload": { ...updated_user[0], temp: newCognitoUser.TemporaryPassword }
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
          "message": "This email is already registered as a HopeTrust user."
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
