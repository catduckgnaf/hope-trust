const HelloSign = require(".");
const { setCustomFields } = require("./utilities");

const getHelloSignSignatureId = async (subject, message, signers, templates, partner, user, cost, additional_plan_credits, additional_plan_cost) => {
  const options = {
    test_mode: process.env.STAGE !== "production" ? 1 : 0,
    clientId: process.env.HELLOSIGN_CLIENT_ID,
    subject,
    message,
    signers,
    custom_fields: setCustomFields(templates, signers, partner, user, cost, additional_plan_credits, additional_plan_cost)
  };
  if (templates.length > 1) options.template_ids = templates;
  if (templates.length === 1) options.template_id = templates[0];
  return HelloSign.signatureRequest.createEmbeddedWithTemplate(options)
  .then((res) => {
    return { success: true, data: res.signature_request };
  }).catch((err) => {
    return { success: false, message: err.message };
  });

};

module.exports = getHelloSignSignatureId;