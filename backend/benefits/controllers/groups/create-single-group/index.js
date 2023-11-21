const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newGroup } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    let config_id;
    let id;
    let created_config = await database.query("SELECT * from benefits_config where cognito_id = $1", cognito_id);
    let existing_record = await database.query("SELECT * from groups where cognito_id = $1", cognito_id);
    if (created_config.length) config_id = created_config[0].id;
    if (!created_config.length) {
      created_config = await database.insert("benefits_config", { cognito_id });
      config_id = created_config;
    }
    if (!existing_record.length) {
      const created = await database.insert(
        "groups", {
        ...newGroup,
        config_id,
        cognito_id,
        status: "active"
      }
      );
      if (!created) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create new group record."
          })
        };
      }
      id = created;
    }
    if (existing_record.length) id = existing_record[0].id;
    await database.updateById("groups", id, { status: "active" });
    const groups = await database.query(`SELECT
          w.*,
          bc.signature_id,
          bc.signature_request_id,
          bc.contract_signed,
          bc.contract_signed_on,
          bc.logo,
          u.first_name,
          u.last_name from groups w
          JOIN users u on u.cognito_id = w.cognito_id
          JOIN benefits_config bc on bc.id = w.config_id
          where w.id = $1 AND w.status = 'active' and u.status = 'active'`, id);
    if (!groups.length) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find group record."
        })
      };
    }
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": true,
        "message": "Successfully fetched group record.",
        "payload": groups[0]
      })
    };
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
