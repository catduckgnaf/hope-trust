const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getHelloSignSignatureId = require("../../../services/hello-sign/get-signature-id");
const getHelloSignEmbedURL = require("../../../services/hello-sign/get-embed-url");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { subject, message, signers, partner_signature_id, templates, plan_type, cost, is_entity, additional_plan_credits, additional_plan_cost, is_upgrade = false } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (!partner_signature_id) {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
      let partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", cognito.id, "active");
      const signature_id = await getHelloSignSignatureId(subject, message, signers, templates, partner, user, cost, additional_plan_credits, additional_plan_cost);
      if (signature_id.success) {
        const embed_link = await getHelloSignEmbedURL(signature_id.data.signatures[0].signature_id);
        if (!embed_link.success) {
          return {
            statusCode: 400,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": embed_link.message
            })
          };
        }
        if (partner) partner = await database.updateById("partners", partner.id, { plan_type: is_upgrade ? partner.plan_type : plan_type, signature_request_id: signature_id.data.signature_request_id, signature_id: signature_id.data.signatures[0].signature_id, is_entity });
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully fetched signature embed link",
            "payload": { embed_link: embed_link.data, request_id: signature_id.data.signature_request_id, partner }
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": signature_id.message
        })
      };
    }
    const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", cognito.id, "active");
    const embed_link = await getHelloSignEmbedURL(partner_signature_id);
    if (embed_link.success) {
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched signature embed link",
          "payload": { embed_link: embed_link.data, partner }
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": embed_link.message
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
