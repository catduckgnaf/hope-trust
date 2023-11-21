const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const updateStripePrice = require("../../../services/stripe/update-stripe-price");
const updateStripeProduct = require("../../../services/stripe/update-stripe-product");
const { convertArray } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { product_id, account_id } = event.pathParameters;
  const { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    let slug = updates.slug;
    let update_price_config = {};
    let update_product_config = {};
    if (updates.status) {
      update_price_config.active = updates.status === "active";
      update_product_config.active = updates.status === "active";
    }
    if (updates.title) {
      update_price_config.nickname = updates.title;
      update_product_config.name = updates.title;
    }
    if (!slug) {
      slug = updates.title.replace(/ /g, "_").toLowerCase();
      update_price_config.slug = slug;
    }
    const updated = await database.updateById("products", product_id, { ...updates, slug, tags: convertArray(updates.tags), features: convertArray(updates.features), contacts: convertArray(updates.contacts)});
    if (updated) {
      await updateStripePrice(updated.price_id, update_price_config);
      await updateStripeProduct(updated.product_id, update_product_config);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated product record",
          "payload": updated
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update product record."
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
