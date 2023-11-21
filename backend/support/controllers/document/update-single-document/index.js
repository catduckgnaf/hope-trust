const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const moveAndDeleteFile = require("../../../services/s3/move-and-delete-object");
const { isEqual } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  let { new_file_config, updates, id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let updated = await database.updateById("documents", id, updates);
    if (new_file_config) {
      const { new_folder, new_key, old_folder, old_key, extension } = new_file_config;
      let filename = "";
      if (new_folder) filename = `${new_folder}/`;
      else filename = `${old_folder}/`;
      if (new_key) filename += new_key;
      else filename += old_key;
      if (!filename.includes(extension)) filename += `.${extension}`;
      if (!isEqual(new_folder, old_folder) || !isEqual(new_key, old_key)) await moveAndDeleteFile(new_file_config, filename);
      updated = await database.updateById("documents", id, { filename });
    }
    if (updated) {
      const document = await database.queryOne(`SELECT
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
        LEFT JOIN users u ON u.cognito_id = d.associated_account_id
        AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = d.associated_account_id)
        AND u.status = 'active'
        JOIN users uu ON uu.cognito_id = d.cognito_id
        AND uu.version = (SELECT MAX (version) FROM users uuu where uuu.cognito_id = d.cognito_id)
        JOIN users uuuu ON uuuu.cognito_id = d.account_id
        AND uuuu.version = (SELECT MAX (version) FROM users uuuuu where uuuuu.cognito_id = d.account_id) 
        AND uuuu.status = 'active'
        where d.id = $1`, updated.id);
      if (document) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully updated document.",
            "payload": document
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find updated document."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update document."
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
