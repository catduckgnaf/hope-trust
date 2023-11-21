const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { capitalize } = require("../../../utilities/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const createMultiInvoice = require("../../../services/stripe/create-multi-invoice");
const getStripeCustomer = require("../../../services/stripe/get-stripe-customer");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { uniqBy } = require("lodash");
const moment = require("moment");
const { config } = require("aws-sdk");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { customer_id, products } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const customer = await getStripeCustomer(customer_id);
    if (customer.success) {
      const charge = await createMultiInvoice(products, customer.response);
      if (charge.success) {
        let updated_features = {};
        let incoming_features = [];
        products.forEach((p) => incoming_features = incoming_features.concat(p.features));
        incoming_features.forEach((feature) => updated_features[feature] = true);
  
        if (Object.keys(updated_features).length) {
          const oldFeatures = await database.queryOne("SELECT * from account_features where account_id = $1", account_id);
          if (oldFeatures) {
            await database.updateById("account_features", oldFeatures.id, { ...updated_features });
          } else {
            await database.insert("account_features", { ...updated_features, account_id });
          }
        }
  
        let email_map = {};
        let all_minified_products = [];
        products.forEach((product) => {
          let minified_product = {
            amount: (product.amount / 100),
            title: product.title,
            description: product.description,
            created_at: moment().toISOString()
          };
          all_minified_products.push(minified_product);
          product.contacts.forEach((contact) => {
            if (email_map[contact]) email_map[contact].push(minified_product);
            else email_map[contact] = [minified_product];
          });
        });
  
        const user = await database.queryOne("SELECT * from users where customer_id = $1 AND status = 'active'", customer_id);
        const requested_by = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", cognito_id);
        const system = await database.queryOne("SELECT u.first_name, u.last_name, u.email from system_settings ss JOIN users u on u.cognito_id = ss.commerce_support where ss.id = 'system_settings' AND u.status = 'active'");
  
        for (let i = 0; i < Object.keys(email_map).length; i++) {
          const email = Object.keys(email_map)[i];
          const email_user = await database.queryOne("SELECT * from users where email = $1 AND status = 'active'", email);
          const email_products = uniqBy(email_map[email], "title");
          await sendTemplateEmail(email, {
            first_name: email_user ? capitalize(email_user.first_name) : "Hope Trust",
            last_name: email_user ? capitalize(email_user.last_name) : "Purchase Notification",
            template_type: "add_on_service_notification",
            merge_fields: {
              first_name: capitalize(user.first_name),
              last_name: capitalize(user.last_name),
              requester_first: capitalize(requested_by.first_name),
              requester_last: capitalize(requested_by.last_name),
              rep_first: email_user ? email_user.first_name : "Product",
              rep_last: email_user ? email_user.last_name : "Vendor",
              phone: user.phone,
              email: user.email,
              requester_email: requested_by.email,
              requester_phone: requested_by.phone,
              products: email_products,
              subject: "Products Purchased on Hope Trust",
              preheader: "The following products were purchased by a Hope Trust user.",
              invoice_pdf: charge.response.invoice_pdf
            }
          });
        }
        await sendTemplateEmail(requested_by.email, {
          first_name: capitalize(requested_by.first_name),
          last_name: capitalize(requested_by.last_name),
          template_type: "client_add_on_service_notification",
          merge_fields: {
            first_name: capitalize(user.first_name),
            last_name: capitalize(user.last_name),
            requester_first: capitalize(requested_by.first_name),
            requester_last: capitalize(requested_by.last_name),
            products: uniqBy(all_minified_products, "title"),
            subject: "Products Purchased on Hope Trust",
            preheader: "The following products were purchased.",
            invoice_pdf: charge.response.invoice_pdf
          }
        });
        if (system.length && !email_map[system.email]) {
          await sendTemplateEmail(system.email, {
            first_name: capitalize(system.first_name),
            last_name: capitalize(system.last_name),
            template_type: "add_on_service_notification",
            merge_fields: {
              first_name: capitalize(user.first_name),
              last_name: capitalize(user.last_name),
              requester_first: capitalize(requested_by.first_name),
              requester_last: capitalize(requested_by.last_name),
              rep_first: system.first_name,
              rep_last: system.last_name,
              phone: user.phone,
              email: user.email,
              requester_email: requested_by.email,
              requester_phone: requested_by.phone,
              products: uniqBy(all_minified_products, "title"),
              subject: "Products Purchased on Hope Trust",
              preheader: "The following products were purchased by a Hope Trust user.",
              invoice_pdf: charge.response.invoice_pdf
            }
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": charge.message
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": charge.message
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": customer.message
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
