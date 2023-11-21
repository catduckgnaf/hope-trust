const { SendGrid, templates, from, replyTo } = require(".");

const sendTemplateEmail = async (email, config) => {
  const message_config = {
    to: {
      email,
      name: `${config.first_name} ${config.last_name}`,
    },
    cc: [],
    from: config.from ? { ...from, ...config.from } : from,
    replyTo: config.replyTo ? { ...replyTo, ...config.replyTo } : replyTo,
    template_id: templates[config.template_type],
    dynamic_template_data: config.merge_fields
  };
  if (config.cc && config.cc.length) message_config.cc.push(...config.cc);
  return SendGrid.send(message_config).then(() => {
    console.log(`Email sent to ${email}.`);
    return true;
  }).catch((error) => {
    console.error(error.toString());
    return false;
  });
};

module.exports = sendTemplateEmail;