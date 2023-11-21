const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const is_google = event.headers.Referer === "http://mail.google.com/";
  if (!is_google) {
    let { message_id } = event.pathParameters;
    message_id = message_id.split(".gif")[0];
    const updated = await database.updateById("messages", message_id, { read: true });
    if (updated) {
      const base64ContentArray = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=".split(",") ;
      const mime_type = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0];
      const base64Data = base64ContentArray[1];
      return {
        statusCode: 200,
        headers: {
          ...getHeaders(),
          "Content-type": mime_type
        },
        body: base64Data.toString("base64"),
        isBase64Encoded: true
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not fetch message."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "Ignoring track request."
    })
  };
};
