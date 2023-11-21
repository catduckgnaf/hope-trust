const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const createStripePrice = require("../../../services/stripe/create-stripe-price");
const getProductPrice = require("../../../services/stripe/get-product-price");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { cognito_id, account_id } = event.pathParameters;
  const { new_product } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let slug = new_product.slug;
    if (!slug) slug = new_product.title.replace(/ /g,"_").toLowerCase();
    const found_slug = await database.queryOne("SELECT * from products where slug = $1 AND status = $2", new_product.slug, "active");
    if (!found_slug) {
      let product_id = new_product.product_id;
      let price_id = new_product.price_id;
      let amount = new_product.amount;
      if (!price_id) {
        const product = await createStripePrice(new_product.title, new_product.amount, slug, new_product.status, product_id);
        if (!product.success) {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": false,
              "message": product.message
            })
          };
        }
        price_id = product.response.id;
        amount = product.response.unit_amount;
        product_id = product.response.product;
      } else {
        const product = await getProductPrice(price_id);
        amount = product.response.unit_amount;
        product_id = product.response.product;
      }
      const created_product = await database.insert(
        "products", {
          ...new_product,
          price_id,
          product_id,
          amount,
          slug,
          cognito_id,
          "status": "active"
        }
      );
      if (created_product) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created product.",
            "payload": created_product
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create product record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "An active product with this slug already exists."
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
