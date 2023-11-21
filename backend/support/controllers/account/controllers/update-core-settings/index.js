const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const getCognitoUser = require("../../../../services/cognito/get-cognito-user");
const static_lists = [
  "income_types",
  "benefit_types",
  "asset_types",
  "budget_categories",
  "document_types",
  "email_signature_identifiers",
  "contact_types"
];
exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  let { updates } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const settings = await database.queryOne("SELECT * from system_settings");
    if (settings) {
      let to_update = static_lists.find((list) => Object.keys(updates).includes(list));
      if (updates[to_update]) {
        let is_updated;
        if (updates[to_update].type !== "new") is_updated = await database.query(`UPDATE system_settings SET ${to_update} = jsonb_remove_array_element(${to_update}, $1)`, (updates[to_update].updated || updates[to_update].value));
        if (["new", "update"].includes(updates[to_update].type)) is_updated = await database.query(`UPDATE system_settings SET ${to_update} = ${to_update} || $1::jsonb where id = 'system_settings'`, { ...updates[to_update].value, "created_at": (updates[to_update].type === "update") ? updates[to_update].value.created_at : new Date() });
        if (is_updated) {
          const updatedSettings = await database.queryOne("SELECT * from system_settings");
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": `Successfully updated ${to_update}.`,
              "payload": updatedSettings
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            success: false,
            message: `Could not update ${to_update}.`
          })
        };
      }
      const updated = await database.updateById("system_settings", settings.id, { ...updates, cognito_id });
      if (updated) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated core settings.",
            "payload": updated
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          success: false,
          message: "Could not update core settings."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        success: false,
        message: "Could not find core settings."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You are not authorized to perform this action."
    })
  };
};
