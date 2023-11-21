const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { updates, lookup_id, type } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const oldFeatures = await database.queryOne("SELECT * from account_features where account_id = $1", lookup_id);
    if (oldFeatures) {
      const oldFeaturesUpdated = await database.updateById("account_features", oldFeatures.id, { ...updates });
      if (oldFeaturesUpdated) {
        let updatedFeatures = false;
        if (type === "partner") updatedFeatures = await database.queryOne("SELECT af.documents, af.org_export, af.create_accounts, af.billing, af.two_factor_authentication, af.security_questions, af.change_password, af.messaging, af.permissions from account_features af where account_id = $1", lookup_id);
        if (type === "user") updatedFeatures = await database.queryOne("SELECT af.in_app_purchases, af.document_generation, af.contact_options, af.surveys, af.documents, af.medications, af.schedule, af.finances, af.create_accounts, af.trust, af.care_coordination, af.relationships, af.providers, af.billing, af.two_factor_authentication, af.permissions, af.security_questions, af.partner_conversion, af.change_password, af.messaging, af.bank_account_linking from account_features af where account_id = $1", lookup_id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated account features.",
            "payload": updatedFeatures
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update account features."
        })
      };
    }
    const created_features = await database.insert("account_features", { ...updates, account_id: lookup_id });
    if (created_features) {
      let updatedFeatures = false;
      if (type === "partner") updatedFeatures = await database.queryOne("SELECT af.documents, af.org_export, af.create_accounts, af.billing, af.two_factor_authentication, af.security_questions, af.change_password, af.messaging, af.permissions from account_features af where account_id = $1", lookup_id);
      if (type === "user") updatedFeatures = await database.queryOne("SELECT af.in_app_purchases, af.document_generation, af.contact_options, af.surveys, af.documents, af.medications, af.schedule, af.finances, af.create_accounts, af.trust, af.care_coordination, af.relationships, af.providers, af.billing, af.two_factor_authentication, af.permissions, af.security_questions, af.partner_conversion, af.change_password, af.messaging, af.bank_account_linking from account_features af where account_id = $1", lookup_id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully updated account features.",
          "payload": updatedFeatures
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create account features."
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
