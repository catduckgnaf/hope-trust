const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { default_generic_features } = require("../../../permissions/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { newWholesaler } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const record = await database.queryOne("SELECT * from wholesalers where LOWER(name) = $1 AND status = $2", newWholesaler.wholesaler.name.toLowerCase(), "active");
    if (!record) {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2 AND version = (SELECT MAX (version) FROM users where cognito_id = $1 AND status = $2)", newWholesaler.wholesaler.cognito_id, "active");
      const created_config = await database.insert("benefits_config", { ...newWholesaler.benefits_config, cognito_id: newWholesaler.wholesaler.cognito_id });
      const created = await database.insert("wholesalers", { ...newWholesaler.wholesaler, config_id: created_config.id, status: "active" });
      await database.insert(
        "accounts", {
          "account_name": `${user.first_name} ${user.last_name}`,
          "cognito_id": user.cognito_id,
          "account_id": user.cognito_id,
          "status": "active",
          "version": 1
        }
      );
      await database.insert("account_features", { ...default_generic_features, account_id: user.cognito_id });
      await database.insert(
        "account_memberships", {
          "cognito_id": user.cognito_id,
          "account_id": user.cognito_id,
          "permissions": ["basic-user", "wholesale", "account-admin-view", "account-admin-edit"],
          "status": "active",
          "primary_contact": true,
          "type": "wholesale",
          "approved": true,
          "version": 1
        }
      );
      if (created) {
        const record = await database.queryOne(`SELECT
          w.*,
          'wholesale' as type,
          w.cognito_id as account_id,
          bc.signature_id,
          bc.signature_request_id,
          bc.contract_signed,
          bc.contract_signed_on,
          bc.logo,
          u.email,
          u.first_name,
          u.last_name from wholesalers w
          JOIN benefits_config bc on bc.id = w.config_id
          JOIN users u on u.cognito_id = bc.cognito_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = u.cognito_id AND uu.status = 'active')
          where w.id = $1 AND w.status = 'active' and u.status = 'active'`, created.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new wholesaler record.",
            "payload": record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new wholesaler record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "An account with this name already exists."
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
