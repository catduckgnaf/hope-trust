const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const documents = await database.query(`SELECT
      d.*,
      d.document_type as icon,
      COALESCE(d.document_type, 'Uncategorized') as document_type,
      COALESCE(split_part(d.filename, '/', 1), d.filename) as folder,
      COALESCE(LEFT(reverse(split_part(reverse(d.filename), '.', 1)), 3), 'unknown') as file_type,
      COALESCE(split_part(d.filename, '/', 2), d.filename) as original_name,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as account_name,
      NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), '') as uploader_name,
      NULLIF(TRIM(concat(uuuu.first_name, ' ', uuuu.last_name)), '') as core_account_name
      from documents d
      LEFT JOIN users u ON u.cognito_id = d.associated_account_id AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = d.associated_account_id) AND u.status = 'active'
      JOIN users uu ON uu.cognito_id = d.cognito_id AND uu.version = (SELECT MAX (version) FROM users uuu where uuu.cognito_id = d.cognito_id)
      JOIN users uuuu ON uuuu.cognito_id = d.account_id AND uuuu.version = (SELECT MAX (version) FROM users uuuuu where uuuuu.cognito_id = d.account_id) AND uuuu.status = 'active'`);
    if (documents.length) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched documents",
          "payload": documents,
          "usage": documents.reduce((a, { size }) => a + size, 0)
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch any documents.",
        "usage": 0
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
