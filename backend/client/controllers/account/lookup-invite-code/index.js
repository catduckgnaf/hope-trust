const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { invite_code } = event.pathParameters;
  if (invite_code) {
    const found_invite = await database.queryOne("SELECT bcc.*, g.name, bc.logo from benefits_client_config bcc JOIN groups g ON g.id = bcc.group_id JOIN benefits_config bc ON bc.id = g.config_id where bcc.invite_code = $1", invite_code);
    if (!found_invite) {
      const is_valid = found_invite.status === "pending";
      if (!is_valid) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Invitation code invalid. Code has already been claimed."
          })
        };
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Sucessfully fetched invitation.",
          "payload": found_invite
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Invitation code invalid. Could not find invitation."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      success: false,
      message: "You must provide an invite code."
    })
  };
};
