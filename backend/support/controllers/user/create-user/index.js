const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const createSendgridContact = require("../../../services/sendgrid/create-sendgrid-contact");

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { newUser, account_id, user_type, beneficiary = {}, notify = false, list_slug } = JSON.parse(event.body);
  if (newUser.cognito_id) {
    const cognito = await getCognitoUser(event, account_id);
    if (cognito.isRequestUser) {
      let username = null;
      if (newUser.email) {
        const is_username_taken = await database.queryOne("SELECT * from users where username = $1 AND version = (SELECT MAX (version) FROM users where username = $1) AND status = 'active'", newUser.email.split("@")[0]);
        if (!is_username_taken.length) username = newUser.email.split("@")[0];
      }
      const created = await database.insert(
        "users", {
          ...newUser,
          username,
          "status": "active",
          "version": 1
        }
      );
      if (created) {
        if (user_type === "customer-support") {
          await sendTemplateEmail(created.email, {
            first_name: capitalize(created.first_name),
            last_name: capitalize(created.last_name),
            template_type: "customer_support_welcome",
            merge_fields: {
              first_name: capitalize(created.first_name),
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/customer-support-login`,
              subject: "Welcome to Hope Trust!",
              preheader: "Your Hope Trust Customer Support account was successfully created"
            }
          });
        } else if (notify) {
          await sendTemplateEmail(created.email, {
            first_name: capitalize(created.first_name),
            last_name: capitalize(created.last_name),
            template_type: "default_welcome",
            merge_fields: {
              first_name: capitalize(created.first_name),
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
              beneficiary_first_name: beneficiary.beneficiaryFirst ? capitalize(beneficiary.beneficiaryFirst) : "your loved one",
              subject: "Welcome to Hope Trust!",
              preheader: "Your Hope Trust account was successfully created"
            }
          });
        }
        await createSendgridContact(created, (list_slug || "registrations"), process.env.STAGE === "production");
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created user",
            "payload": created
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
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You must provide information to create a new user."
    })
  };
};
