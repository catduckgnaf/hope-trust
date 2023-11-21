const HelloSign = require(".");
const { setCustomFields } = require("./utilities");

const getHelloSignSignatureId = async (subject, message, signers, templates, benefits_config, user, config) => {
  const options = {
    test_mode: process.env.STAGE !== "production" ? 1 : 0,
    clientId: process.env.HELLOSIGN_CLIENT_ID,
    subject,
    message,
    signers,
    custom_fields: setCustomFields(templates, signers, benefits_config, user, config)
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