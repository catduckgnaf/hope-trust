const { SendGrid, templates, from } = require(".");

const sendTemplateEmail = async (email, config) => {
  const message_config = {
    to: {
      email,
      name: `${config.first_name} ${config.last_name}`,
    },
    from: config.from ? { ...from, ...config.from } : from,
    template_id: templates[config.template_type],
    dynamic_template_data: config.merge_fields
};
return SendGrid.send(message_config).then(() => {
    console.log(`Email sent to ${email}.`);
    return true;
}).catch((error) => {
    console.error(error.toString());
    return false;
});
};

module.exports = sendTemplateEmail;