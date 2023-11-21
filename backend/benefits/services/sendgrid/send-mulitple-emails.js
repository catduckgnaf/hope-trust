const { SendGrid, from } = require(".");

const sendMultipleEmails = async (emails, config) => {
  const message_config = {
    to: emails,
    from,
    subject: config.subject,
    text: config.text,
    html: config.html
  };
  return SendGrid.send(message_config).then(() => {
    console.log(`${emails.length} emails sent.`);
    return true;
  }).catch((error) => {
    console.error(error.toString());
    return false;
  });
};

module.exports = sendMultipleEmails;