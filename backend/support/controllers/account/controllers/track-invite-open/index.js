const { database } = require("../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const is_google = event.headers.Referer === "http://mail.google.com/";
  if (!is_google) {
    let { invite_id } = event.pathParameters;
    invite_id = invite_id.split(".gif")[0];
    const updated = await database.update("benefits_client_config", { invite_status: "read" }, { id: invite_id });
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
        "message": "Could not fetch pixel."
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
