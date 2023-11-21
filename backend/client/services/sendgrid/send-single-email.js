const { SendGrid, from, replyTo } = require(".");

const sendSingleEmail = async (email, config) => {
  const message_config = {
    to: {
      email,
      name: `${config.first_name} ${config.last_name}`,
    },
    from,
    replyTo,
    subject: config.subject,
    text: config.text,
    html: config.html
  };
  return SendGrid.send(message_config).then(() => {
      console.log(`Email sent to ${email}.`);
      return true;
    }).catch((error) => {
      console.error(error.toString());
      return false;
    });
};

module.exports = sendSingleEmail;