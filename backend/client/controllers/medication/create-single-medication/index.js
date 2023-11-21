const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newMedication } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const created = await database.insert(
      "medications", {
        ...newMedication,
        cognito_id,
        account_id
      }
    );
    if (created) {
      const medication = await database.queryOne(`SELECT DISTINCT ON (m.id)
        m.*,
        CASE
          WHEN u.cognito_id IS NOT NULL THEN NULLIF(TRIM(concat(u.first_name, ' ', u.last_name, NULLIF(TRIM(concat_ws(' - ', am.type)), ''))), '')
          ELSE m.assistant
        END AS assistant_name,
        CASE
          WHEN m.provider_id IS NOT NULL THEN (SELECT COALESCE(NULLIF(TRIM(concat(p.contact_first, ' ', p.contact_last, concat_ws(' | ', p.name, p.specialty))), ''), m.physician) FROM account_providers p WHERE p.id = m.provider_id AND p.status = 'active')
          ELSE m.physician
        END AS physician
        FROM medications m
        LEFT JOIN users u ON u.cognito_id = m.assistant AND u.status = 'active'
        LEFT JOIN account_memberships am ON m.cognito_id = u.cognito_id AND am.account_id = m.account_id AND am.status = 'active'
        WHERE m.id = $1`, created.id);
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new medication.",
          "payload": medication
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new medication."
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
